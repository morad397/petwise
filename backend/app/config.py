from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App settings, read from environment variables or backend/.env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # MongoDB connection string, e.g. the one MongoDB Atlas gives you:
    # mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db: str = "petwise"

    jwt_secret: str = "dev-only-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24
    cors_origins: str = "http://localhost:5173"

    admin_email: str = ""
    admin_password: str = ""
    admin_name: str = "PetWise Admin"

    # password for the demo accounts created by `python -m app.demo_data`
    demo_password: str = ""

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
