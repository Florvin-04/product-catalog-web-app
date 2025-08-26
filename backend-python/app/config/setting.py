from pydantic import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str

    class Config:
        env_file = ".env"  # looks in project root


settings = Settings()
