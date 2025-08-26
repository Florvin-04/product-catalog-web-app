from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from db import Session
from models import User, user_schema_payload
from typing import Type
from pydantic import BaseModel


class Payload(BaseModel):
    email: str
    name: str


def add_user(user: Payload):
    try:
        with Session() as session:

            existing_user = session.query(User).filter(User.email == user.email).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="user already exist")

            new_user = User(name=user.name, email=user.email)
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
            return new_user

    except SQLAlchemyError as e:
        # Only catch database errors, not HTTPException
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
