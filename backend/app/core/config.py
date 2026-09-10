from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ORB - Online Raithu Bazaar"
    app_env: str = "development"
    debug: bool = True

    database_url: str

    cors_origins: str = "http://localhost:5173"
    secret_key: str
    access_token_expire_minutes: int = 60

    razorpay_key_id: str
    razorpay_key_secret: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()