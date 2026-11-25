"""Admin: dashboard numbers (Dashboard / Analytics services), reported posts, activity log."""

from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.database import Database

from app.core.deps import require_roles
from app.database import get_db, to_out
from app.roles import Role
from app.schemas.common import CamelModel
from app.services.notify import log_activity

router = APIRouter(prefix="/admin", tags=["Admin"])
admin_only = require_roles(Role.ADMIN)

LOW_STOCK = 5


class RecentUser(CamelModel):
    id: int
    full_name: str
    email: str
    role: str
    status: str
    created_at: datetime


class RecentOrder(CamelModel):
    id: int
    customer_name: Optional[str] = None
    total_amount: float
    status: str
    payment_status: str
    order_date: datetime


class StatsOut(CamelModel):
    users_total: int
    users_by_role: dict
    new_users_7_days: int
    pets_total: int
    appointments_today: int
    appointments_pending: int
    orders_total: int
    orders_processing: int
    revenue_paid: float
    low_stock_products: int
    out_of_stock_products: int
    open_reports: int
    recent_users: List[RecentUser]
    recent_orders: List[RecentOrder]


@router.get("/stats", response_model=StatsOut)
def dashboard_stats(db: Database = Depends(get_db), _: dict = Depends(admin_only)):
    """Dashboard.loadOverview + Analytics (revenue, user growth)."""
    now_utc = datetime.now(timezone.utc)
    today = now_utc.date().isoformat()
    by_role = {role.value: db.users.count_documents({"role": role.value}) for role in Role}
    revenue = sum(o["total_amount"] for o in db.orders.find({"payment_status": "PAID"}, {"total_amount": 1}))
    return {
        "users_total": sum(by_role.values()),
        "users_by_role": by_role,
        "new_users_7_days": db.users.count_documents({"created_at": {"$gte": now_utc - timedelta(days=7)}}),
        "pets_total": db.pets.count_documents({}),
        "appointments_today": db.appointments.count_documents(
            {"appointment_date": today, "status": {"$nin": ["CANCELLED", "REJECTED"]}}
        ),
        "appointments_pending": db.appointments.count_documents({"status": "PENDING"}),
        "orders_total": db.orders.count_documents({}),
        "orders_processing": db.orders.count_documents({"status": "PROCESSING"}),
        "revenue_paid": round(revenue, 2),
        "low_stock_products": db.products.count_documents({"stock_quantity": {"$gt": 0, "$lte": LOW_STOCK}}),
        "out_of_stock_products": db.products.count_documents({"stock_quantity": 0}),
        "open_reports": len(db.post_reports.distinct("post_id")),
        "recent_users": [to_out(u) for u in db.users.find().sort("_id", -1).limit(5)],
        "recent_orders": [to_out(o) for o in db.orders.find().sort("_id", -1).limit(5)],
    }


# ---------------- reported posts (content management) ----------------

class ReportedPost(CamelModel):
    post_id: int
    author_name: str
    content: str
    media_url: Optional[str] = None
    created_at: datetime
    report_count: int
    reasons: List[str]
    last_reported_at: datetime


@router.get("/reports", response_model=List[ReportedPost])
def reported_posts(db: Database = Depends(get_db), _: dict = Depends(admin_only)):
    grouped = {}
    for report in db.post_reports.find().sort("_id", 1):
        entry = grouped.setdefault(report["post_id"], {"reasons": [], "last": report["created_at"]})
        entry["reasons"].append(report["reason"])
        entry["last"] = max(entry["last"], report["created_at"])
    result = []
    for post in db.posts.find({"_id": {"$in": list(grouped)}}):
        entry = grouped[post["_id"]]
        result.append(
            {
                "post_id": post["_id"],
                "author_name": post["author_name"],
                "content": post.get("content") or "",
                "media_url": post.get("media_url"),
                "created_at": post["created_at"],
                "report_count": len(entry["reasons"]),
                "reasons": entry["reasons"],
                "last_reported_at": entry["last"],
            }
        )
    return sorted(result, key=lambda r: r["last_reported_at"], reverse=True)


@router.delete("/reports/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def dismiss_reports(post_id: int, db: Database = Depends(get_db), admin: dict = Depends(admin_only)):
    """Keeps the post and removes its reports (the post was fine)."""
    result = db.post_reports.delete_many({"post_id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No reports for this post")
    log_activity(db, admin, "Reports Dismissed", f"Post #{post_id}")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------------- activity log ----------------

class ActivityOut(CamelModel):
    id: int
    actor_name: str
    action: str
    target: str
    result: str
    created_at: datetime


@router.get("/activity", response_model=List[ActivityOut])
def activity_log(limit: int = 50, db: Database = Depends(get_db), _: dict = Depends(admin_only)):
    return [to_out(a) for a in db.activity_log.find().sort("_id", -1).limit(min(max(limit, 1), 200))]
