from fastapi import APIRouter
from .user import router as user_router
from .products import router as product_router
from .category import router as category_router

router = APIRouter()

router.include_router(user_router, prefix="/users", tags=["Users"])

router.include_router(product_router, prefix="/products", tags=["Products"])

router.include_router(category_router, prefix="/categories", tags=["Category"])
