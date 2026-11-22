from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.database import Database

from app.core.deps import get_current_user
from app.database import get_db, new_document, now, to_out
from app.roles import Role
from app.schemas.pet import PetCreate, PetOut, PetUpdate

router = APIRouter(prefix="/pets", tags=["Pets"])


def _get_pet_for_user(db: Database, pet_id: int, user: dict) -> dict:
    """Load a pet and make sure the current user may access it (server-side check)."""
    pet = db.pets.find_one({"_id": pet_id})
    if pet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet not found")
    if pet["owner_id"] != user["_id"] and user["role"] != Role.ADMIN.value:
        # Clinic staff access to their clinic's patients comes with the appointments module.
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not have permission to view this pet")
    return pet


@router.get("", response_model=List[PetOut])
def list_my_pets(user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    return [to_out(p) for p in db.pets.find({"owner_id": user["_id"]}).sort("_id", 1)]


@router.post("", response_model=PetOut, status_code=status.HTTP_201_CREATED)
def create_pet(
    data: PetCreate,
    user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    pet = new_document(db, "pets", owner_id=user["_id"], **data.model_dump(mode="json"))
    db.pets.insert_one(pet)
    return to_out(pet)


@router.get("/{pet_id}", response_model=PetOut)
def get_pet(pet_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    return to_out(_get_pet_for_user(db, pet_id, user))


@router.put("/{pet_id}", response_model=PetOut)
def update_pet(
    pet_id: int,
    data: PetUpdate,
    user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    _get_pet_for_user(db, pet_id, user)
    changes = data.model_dump(mode="json", exclude_unset=True)
    changes["updated_at"] = now()
    db.pets.update_one({"_id": pet_id}, {"$set": changes})
    return to_out(db.pets.find_one({"_id": pet_id}))


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pet(pet_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    _get_pet_for_user(db, pet_id, user)
    db.pets.delete_one({"_id": pet_id})
    return Response(status_code=status.HTTP_204_NO_CONTENT)
