from fastapi import APIRouter
from controllers import add_category
from models import CategoryCreateModel

router = APIRouter()


@router.post("/")
def create_category(category: CategoryCreateModel):
    category = add_category(category)
    return {"success": True, "data": {"category": category}}
