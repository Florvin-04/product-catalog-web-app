from fastapi import APIRouter
from models import User
from controllers import add_user
from pydantic import BaseModel

router = APIRouter()

class Payload(BaseModel):
    email: str
    name: str


@router.post("/")
def create_user(user: Payload):
    """
    Create a new user.
    """

    user = add_user("user")
    return {"message": "User created successfully", "user": user}


@router.get("/")
def read_user():
    """
    Read a user by ID.
    """
    # Logic to read a user
    return {"message": "User retrieved successfully", "user_id": 1}
