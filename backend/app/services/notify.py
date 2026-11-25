"""Notifications (sent on events) and the admin activity log."""

from typing import Iterable, Optional

from pymongo.database import Database

from app.database import new_document


def notify(
    db: Database,
    user_ids,
    *,
    type: str,
    title: str,
    message: Optional[str] = None,
    link: Optional[str] = None,
    exclude: Optional[int] = None,
) -> None:
    """Sends a notification to one user (int) or several users (list).

    `exclude` skips the user who caused the event (no notification about your own action).
    """
    if isinstance(user_ids, int):
        user_ids = [user_ids]
    docs = [
        new_document(
            db, "notifications", user_id=uid, type=type, title=title, message=message, link=link, is_read=False
        )
        for uid in dict.fromkeys(user_ids)
        if uid is not None and uid != exclude
    ]
    if docs:
        db.notifications.insert_many(docs)


def clinic_staff_ids(db: Database, clinic_id: int) -> Iterable[int]:
    return [u["_id"] for u in db.users.find({"role": "CLINIC_STAFF", "clinic_id": clinic_id, "status": "ACTIVE"}, {"_id": 1})]


def log_activity(db: Database, actor: dict, action: str, target: str, result: str = "Success") -> None:
    """Records an admin action for the activity log on the System page."""
    db.activity_log.insert_one(
        new_document(
            db,
            "activity_log",
            actor_id=actor["_id"],
            actor_name=actor["full_name"],
            action=action,
            target=target,
            result=result,
        )
    )
