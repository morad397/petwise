"""Community: posts, comments, likes, saved posts and reports.

Permissions (Agile iteration 4):
- any logged-in user can read, post, comment, like and save
- only the author can edit a post
- the author or an admin can delete a post or comment (admin = content management)
"""

import re
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.database import Database

from app.core.deps import get_current_user
from app.database import get_db, new_document, now, to_out
from app.roles import Role
from app.services.notify import log_activity, notify
from app.schemas.community import (
    BookmarkOut,
    CommentIn,
    CommentOut,
    LikeOut,
    PostIn,
    PostOut,
    PostUpdate,
    ReportIn,
)

router = APIRouter(tags=["Community"])

HASHTAG = re.compile(r"#\w+")


def _hashtags(text: str) -> list:
    return list(dict.fromkeys(HASHTAG.findall(text or "")))


def _post_out(post: dict, user: dict) -> dict:
    liked_by = post.get("liked_by", [])
    out = to_out(post)
    out.pop("liked_by", None)
    out.pop("bookmarked_by", None)
    out.update(
        like_count=len(liked_by),
        liked_by_me=user["_id"] in liked_by,
        bookmarked_by_me=user["_id"] in post.get("bookmarked_by", []),
    )
    return out


def _load_post(db: Database, post_id: int) -> dict:
    post = db.posts.find_one({"_id": post_id})
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post not found")
    return post


def _can_moderate(user: dict, author_id: int) -> bool:
    return user["_id"] == author_id or user["role"] == Role.ADMIN.value


# ---------------- posts ----------------

@router.get("/posts", response_model=List[PostOut])
def list_posts(
    hashtag: Optional[str] = None,
    saved: bool = False,
    user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    query = {}
    if hashtag:
        query["hashtags"] = hashtag if hashtag.startswith("#") else f"#{hashtag}"
    if saved:
        query["bookmarked_by"] = user["_id"]
    return [_post_out(p, user) for p in db.posts.find(query).sort("_id", -1).limit(100)]


@router.post("/posts", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(data: PostIn, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    pet = None
    if data.pet_id is not None:
        pet = db.pets.find_one({"_id": data.pet_id, "owner_id": user["_id"]})
        if pet is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Pet not found")
    post = new_document(
        db,
        "posts",
        author_id=user["_id"],
        author_name=user["full_name"],
        author_role=user["role"],
        content=data.content.strip(),
        media_url=data.media_url,
        media_type=data.media_type if data.media_url else None,
        pet_id=pet["_id"] if pet else None,
        pet_name=pet["name"] if pet else None,
        hashtags=_hashtags(data.content),
        liked_by=[],
        bookmarked_by=[],
        comment_count=0,
    )
    db.posts.insert_one(post)
    return _post_out(post, user)


@router.put("/posts/{post_id}", response_model=PostOut)
def edit_post(post_id: int, data: PostUpdate, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    post = _load_post(db, post_id)
    if post["author_id"] != user["_id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only edit your own posts")
    content = data.content.strip()
    if not content and not post.get("media_url"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "A post cannot be empty")
    db.posts.update_one(
        {"_id": post_id}, {"$set": {"content": content, "hashtags": _hashtags(content), "updated_at": now()}}
    )
    return _post_out(db.posts.find_one({"_id": post_id}), user)


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    post = _load_post(db, post_id)
    if not _can_moderate(user, post["author_id"]):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only delete your own posts")
    db.posts.delete_one({"_id": post_id})
    db.comments.delete_many({"post_id": post_id})
    db.post_reports.delete_many({"post_id": post_id})
    if user["_id"] != post["author_id"]:  # removed by an admin (content moderation)
        log_activity(db, user, "Post Removed", f"Post #{post_id} by {post['author_name']}")
        notify(
            db,
            post["author_id"],
            type="POST_REMOVED",
            title="Your post was removed by an administrator",
            message=(post.get("content") or "")[:80] or None,
            link="/community",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/posts/{post_id}/like", response_model=LikeOut)
def toggle_like(post_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    """Like.create / Like.delete: one like per user per post."""
    post = _load_post(db, post_id)
    liked = user["_id"] in post.get("liked_by", [])
    db.posts.update_one({"_id": post_id}, {"$pull" if liked else "$addToSet": {"liked_by": user["_id"]}})
    post = db.posts.find_one({"_id": post_id})
    return LikeOut(liked=not liked, like_count=len(post.get("liked_by", [])))


@router.post("/posts/{post_id}/bookmark", response_model=BookmarkOut)
def toggle_bookmark(post_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    post = _load_post(db, post_id)
    saved = user["_id"] in post.get("bookmarked_by", [])
    db.posts.update_one({"_id": post_id}, {"$pull" if saved else "$addToSet": {"bookmarked_by": user["_id"]}})
    return BookmarkOut(bookmarked=not saved)


@router.post("/posts/{post_id}/report", status_code=status.HTTP_201_CREATED)
def report_post(post_id: int, data: ReportIn, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    _load_post(db, post_id)
    db.post_reports.insert_one(
        new_document(db, "post_reports", post_id=post_id, reported_by=user["_id"], reason=data.reason)
    )
    return {"reported": True}


# ---------------- comments ----------------

@router.get("/posts/{post_id}/comments", response_model=List[CommentOut])
def list_comments(post_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    _load_post(db, post_id)
    return [to_out(c) for c in db.comments.find({"post_id": post_id}).sort("_id", 1)]


@router.post("/posts/{post_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def add_comment(post_id: int, data: CommentIn, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    post = _load_post(db, post_id)
    content = data.content.strip()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "A comment cannot be empty")
    comment = new_document(
        db, "comments", post_id=post_id, author_id=user["_id"], author_name=user["full_name"], content=content
    )
    db.comments.insert_one(comment)
    db.posts.update_one({"_id": post_id}, {"$inc": {"comment_count": 1}})
    notify(
        db,
        post["author_id"],
        type="NEW_COMMENT",
        title=f"{user['full_name']} commented on your post",
        message=content[:80],
        link="/community",
        exclude=user["_id"],
    )
    return to_out(comment)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    comment = db.comments.find_one({"_id": comment_id})
    if comment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Comment not found")
    if not _can_moderate(user, comment["author_id"]):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only delete your own comments")
    db.comments.delete_one({"_id": comment_id})
    db.posts.update_one({"_id": comment["post_id"]}, {"$inc": {"comment_count": -1}})
    return Response(status_code=status.HTTP_204_NO_CONTENT)
