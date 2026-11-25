"""The logged-in user's notifications."""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.database import Database

from app.core.deps import get_current_user
from app.database import get_db, now, to_out
from app.schemas.common import CamelModel

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationOut(CamelModel):
    id: int
    type: str
    title: str
    message: Optional[str] = None
    link: Optional[str] = None
    is_read: bool
    created_at: datetime


class NotificationList(CamelModel):
    items: List[NotificationOut]
    unread_count: int


@router.get("", response_model=NotificationList)
def my_notifications(limit: int = 30, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    items = db.notifications.find({"user_id": user["_id"]}).sort("_id", -1).limit(min(max(limit, 1), 100))
    unread = db.notifications.count_documents({"user_id": user["_id"], "is_read": False})
    return {"items": [to_out(n) for n in items], "unread_count": unread}


@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    result = db.notifications.update_one(
        {"_id": notification_id, "user_id": user["_id"]}, {"$set": {"is_read": True, "updated_at": now()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found")
    return to_out(db.notifications.find_one({"_id": notification_id}))


@router.post("/read-all")
def mark_all_read(user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    result = db.notifications.update_many(
        {"user_id": user["_id"], "is_read": False}, {"$set": {"is_read": True, "updated_at": now()}}
    )
    return {"updated": result.modified_count}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    result = db.notifications.delete_one({"_id": notification_id, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
