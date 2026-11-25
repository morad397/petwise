"""SOS page: emergency contact settings and first-aid guides.

Everyone (even before logging in) can read them; only admins change them.
"""

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import Field
from pymongo.database import Database

from app.core.deps import require_roles
from app.database import get_db, new_document, now, to_out
from app.roles import Role
from app.schemas.common import CamelModel
from app.services.notify import log_activity

router = APIRouter(prefix="/emergency", tags=["Emergency (SOS)"])
admin_only = require_roles(Role.ADMIN)

SETTINGS_ID = "emergency"
DEFAULT_DISCLAIMER = (
    "PetWise does not provide a veterinary diagnosis. If you are unsure or your pet's condition is "
    "worsening, contact a licensed veterinarian immediately."
)


class EmergencySettings(CamelModel):
    emergency_phone: str = Field(default="", max_length=40)
    emergency_contact_name: str = Field(default="", max_length=120)
    availability_text: str = Field(default="", max_length=120)
    emergency_disclaimer: str = Field(default=DEFAULT_DISCLAIMER, max_length=1000)


class GuideIn(CamelModel):
    title: str = Field(min_length=1, max_length=120)
    summary: str = Field(default="", max_length=300)
    warning: Optional[str] = Field(default=None, max_length=300)
    instructions: List[str] = Field(min_length=1, max_length=20)
    source_name: str = Field(default="", max_length=150)
    source_url: Optional[str] = Field(default=None, max_length=500)
    reviewed_at: Optional[date] = None
    active: bool = True


class GuideOut(GuideIn):
    id: int


# ---------------- settings ----------------

@router.get("/settings", response_model=EmergencySettings)
def get_settings(db: Database = Depends(get_db)):
    doc = db.settings.find_one({"_id": SETTINGS_ID}) or {}
    return EmergencySettings(**{k: v for k, v in doc.items() if k in EmergencySettings.model_fields})


@router.put("/settings", response_model=EmergencySettings)
def update_settings(data: EmergencySettings, db: Database = Depends(get_db), admin: dict = Depends(admin_only)):
    db.settings.update_one({"_id": SETTINGS_ID}, {"$set": {**data.model_dump(), "updated_at": now()}}, upsert=True)
    log_activity(db, admin, "Emergency Settings Updated", data.emergency_contact_name or data.emergency_phone or "(cleared)")
    return data


# ---------------- first-aid guides ----------------

@router.get("/guides", response_model=List[GuideOut])
def list_guides(include_inactive: bool = False, db: Database = Depends(get_db)):
    query = {} if include_inactive else {"active": True}
    return [to_out(g) for g in db.emergency_guides.find(query).sort("_id", 1)]


@router.post("/guides", response_model=GuideOut, status_code=status.HTTP_201_CREATED)
def create_guide(data: GuideIn, db: Database = Depends(get_db), admin: dict = Depends(admin_only)):
    values = data.model_dump(mode="json")
    values["instructions"] = [step.strip() for step in data.instructions if step.strip()]
    if not values["instructions"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Add at least one instruction step")
    guide = new_document(db, "emergency_guides", **values)
    db.emergency_guides.insert_one(guide)
    log_activity(db, admin, "First-Aid Guide Created", guide["title"])
    return to_out(guide)


@router.put("/guides/{guide_id}", response_model=GuideOut)
def update_guide(guide_id: int, data: GuideIn, db: Database = Depends(get_db), admin: dict = Depends(admin_only)):
    values = data.model_dump(mode="json")
    values["instructions"] = [step.strip() for step in data.instructions if step.strip()]
    if not values["instructions"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Add at least one instruction step")
    result = db.emergency_guides.update_one({"_id": guide_id}, {"$set": {**values, "updated_at": now()}})
    if result.matched_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guide not found")
    log_activity(db, admin, "First-Aid Guide Updated", values["title"])
    return to_out(db.emergency_guides.find_one({"_id": guide_id}))


@router.delete("/guides/{guide_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guide(guide_id: int, db: Database = Depends(get_db), admin: dict = Depends(admin_only)):
    guide = db.emergency_guides.find_one({"_id": guide_id})
    if guide is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Guide not found")
    db.emergency_guides.delete_one({"_id": guide_id})
    log_activity(db, admin, "First-Aid Guide Deleted", guide["title"])
    return Response(status_code=status.HTTP_204_NO_CONTENT)
