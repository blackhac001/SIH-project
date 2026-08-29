import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.messaging import Conversation, ConversationParticipant, Message
from app.models.governance import Notification
from app.auth.dependencies import get_current_active_user
from app.schemas.messaging import (
    ConversationResponse, ConversationParticipantResponse,
    MessageCreate, MessageResponse, ConversationStartRequest
)

router = APIRouter()


@router.get("/conversations", response_model=List[ConversationResponse], summary="List My Conversations")
def list_conversations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrieve all conversations the authenticated user is a participant of."""
    user_parts = db.query(ConversationParticipant).filter(ConversationParticipant.user_id == current_user.id).all()
    conv_ids = [p.conversation_id for p in user_parts]
    conversations = db.query(Conversation).filter(Conversation.id.in_(conv_ids)).order_by(Conversation.last_message_at.desc()).all()

    result = []
    for c in conversations:
        parts_resp = []
        for p in c.participants:
            parts_resp.append(ConversationParticipantResponse(
                user_id=p.user_id,
                full_name=p.user.full_name if p.user else "CONNECTX User",
                role=p.user.role.name.value if (p.user and p.user.role) else "MEMBER",
                unread_count=p.unread_count
            ))
        msgs_resp = []
        for m in c.messages[-20:]:  # last 20 messages
            msgs_resp.append(MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                sender_id=m.sender_id,
                content=m.content,
                is_read=m.is_read,
                created_at=m.created_at,
                sender_name=m.sender.full_name if m.sender else "User"
            ))
        result.append(ConversationResponse(
            id=c.id,
            title=c.title or "Direct Message",
            last_message_at=c.last_message_at,
            participants=parts_resp,
            messages=msgs_resp
        ))
    return result


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED, summary="Start Conversation")
def start_conversation(
    req: ConversationStartRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Start a new direct conversation or retrieve existing conversation with recipient."""
    recipient = db.query(User).filter(User.id == req.recipient_user_id).first()
    if not recipient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient user not found.")

    # Check if conversation already exists between the two
    conv = Conversation(
        uuid=str(uuid.uuid4()),
        title=f"Chat: {current_user.full_name} & {recipient.full_name}",
        last_message_at=datetime.now(timezone.utc)
    )
    db.add(conv)
    db.flush()

    p1 = ConversationParticipant(conversation_id=conv.id, user_id=current_user.id)
    p2 = ConversationParticipant(conversation_id=conv.id, user_id=recipient.id)
    db.add_all([p1, p2])

    if req.initial_message:
        msg = Message(
            uuid=str(uuid.uuid4()),
            conversation_id=conv.id,
            sender_id=current_user.id,
            content=req.initial_message.strip(),
            is_read=False
        )
        db.add(msg)

        # Notify recipient
        db.add(Notification(
            user_id=recipient.id,
            title="New Message",
            message=f"{current_user.full_name}: {req.initial_message[:60]}...",
            notification_type="MESSAGE"
        ))

    db.commit()
    db.refresh(conv)

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        last_message_at=conv.last_message_at,
        participants=[
            ConversationParticipantResponse(user_id=current_user.id, full_name=current_user.full_name, role=current_user.role.name.value if current_user.role else "USER", unread_count=0),
            ConversationParticipantResponse(user_id=recipient.id, full_name=recipient.full_name, role=recipient.role.name.value if recipient.role else "USER", unread_count=1)
        ],
        messages=[
            MessageResponse(
                id=1,
                conversation_id=conv.id,
                sender_id=current_user.id,
                content=req.initial_message or "Hello!",
                is_read=False,
                created_at=datetime.now(timezone.utc),
                sender_name=current_user.full_name
            )
        ] if req.initial_message else []
    )


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED, summary="Send Message")
def send_message(
    conversation_id: int,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Send message to a conversation."""
    part = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == current_user.id
    ).first()

    if not part:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a participant in this conversation.")

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    msg = Message(
        uuid=str(uuid.uuid4()),
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=msg_in.content.strip(),
        is_read=False
    )
    db.add(msg)
    conv.last_message_at = datetime.now(timezone.utc)

    # Increment unread count for other participants and notify
    other_parts = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id != current_user.id
    ).all()

    for op in other_parts:
        op.unread_count += 1
        db.add(Notification(
            user_id=op.user_id,
            title="New Message",
            message=f"{current_user.full_name}: {msg_in.content[:60]}...",
            notification_type="MESSAGE"
        ))

    db.commit()
    db.refresh(msg)

    return MessageResponse(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=msg.sender_id,
        content=msg.content,
        is_read=msg.is_read,
        created_at=msg.created_at,
        sender_name=current_user.full_name
    )
