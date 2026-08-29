from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.governance import Notification
from app.auth.dependencies import get_current_active_user
from app.schemas.notification import NotificationResponse

router = APIRouter()


@router.get("", response_model=List[NotificationResponse], summary="List My Notifications")
def get_my_notifications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrieve all notifications for the authenticated user."""
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.id.desc()).limit(50).all()


@router.post("/{notification_id}/read", response_model=NotificationResponse, summary="Mark Notification Read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Mark a specific notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/read-all", summary="Mark All Notifications Read")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Mark all notifications as read for current user."""
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read."}
