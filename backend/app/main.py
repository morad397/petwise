import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import get_db
from app.routers import appointments, auth, clinics, community, medical, pets, reminders, shop, staff, users
from app.seed import seed

logger = logging.getLogger("petwise")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Prepare the database (indexes, demo clinics, admin account) when the server starts.
    try:
        seed(get_db())
    except Exception:  # keep the server up so /api/health and the logs show what went wrong
        logger.exception("Could not prepare the database. Check MONGODB_URL.")
    yield


app = FastAPI(
    title="PetWise API",
    description="Backend for the PetWise pet-care platform (Kinneret College final project).",
    version="0.4.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(clinics.router, prefix=API_PREFIX)
app.include_router(pets.router, prefix=API_PREFIX)
app.include_router(medical.vaccinations_router, prefix=API_PREFIX)
app.include_router(medical.treatments_router, prefix=API_PREFIX)
app.include_router(medical.weights_router, prefix=API_PREFIX)
app.include_router(reminders.router, prefix=API_PREFIX)
app.include_router(appointments.router, prefix=API_PREFIX)
app.include_router(staff.router, prefix=API_PREFIX)
app.include_router(shop.router, prefix=API_PREFIX)
app.include_router(community.router, prefix=API_PREFIX)


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}
