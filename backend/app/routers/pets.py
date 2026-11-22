from typing import List

from fastapi import APIRouter, Depends, Response, status
from pymongo.database import Database

from app.core.access import delete_pet_data, get_pet_or_error
from app.core.deps import get_current_user
from app.database import get_db, new_document, now, to_out
from app.schemas.pet import PetCreate, PetOut, PetUpdate

router = APIRouter(prefix="/pets", tags=["Pets"])


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
    # Clinic staff may view pets that have an appointment at their clinic.
    return to_out(get_pet_or_error(db, pet_id, user, allow_staff=True))


@router.put("/{pet_id}", response_model=PetOut)
def update_pet(
    pet_id: int,
    data: PetUpdate,
    user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    get_pet_or_error(db, pet_id, user)
    changes = data.model_dump(mode="json", exclude_unset=True)
    changes["updated_at"] = now()
    db.pets.update_one({"_id": pet_id}, {"$set": changes})
    return to_out(db.pets.find_one({"_id": pet_id}))


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pet(pet_id: int, user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    get_pet_or_error(db, pet_id, user)
    db.pets.delete_one({"_id": pet_id})
    delete_pet_data(db, [pet_id])
    return Response(status_code=status.HTTP_204_NO_CONTENT)
