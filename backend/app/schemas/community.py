"""Community class diagram: CommunityPost, Comment, Like."""

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import Field, model_validator

from app.schemas.common import CamelModel

MAX_MEDIA_CHARS = 8 * 1024 * 1024  # ~6 MB file once base64-encoded


class PostIn(CamelModel):
    content: str = Field(default="", max_length=3000)
    media_url: Optional[str] = Field(default=None, max_length=MAX_MEDIA_CHARS)
    media_type: Optional[Literal["image", "video"]] = None
    pet_id: Optional[int] = None

    @model_validator(mode="after")
    def not_empty(self):
        if not self.content.strip() and not self.media_url:
            raise ValueError("Write something or add a photo")
        return self


class PostUpdate(CamelModel):
    content: str = Field(max_length=3000)


class PostOut(CamelModel):
    id: int
    author_id: int
    author_name: str
    author_role: str
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    pet_id: Optional[int] = None
    pet_name: Optional[str] = None
    hashtags: List[str] = []
    like_count: int = 0
    comment_count: int = 0
    liked_by_me: bool = False
    bookmarked_by_me: bool = False
    created_at: datetime
    updated_at: datetime


class LikeOut(CamelModel):
    liked: bool
    like_count: int


class BookmarkOut(CamelModel):
    bookmarked: bool


class CommentIn(CamelModel):
    content: str = Field(min_length=1, max_length=1000)


class CommentOut(CamelModel):
    id: int
    post_id: int
    author_id: int
    author_name: str
    content: str
    created_at: datetime


class ReportIn(CamelModel):
    reason: str = Field(min_length=1, max_length=500)
