from fastapi import APIRouter

from controllers import add_product, get_all_products

from models import ProductCreateModel, Product

router = APIRouter()


@router.post("/")
def create_product(product: ProductCreateModel):
    """
    Create a new user.
    """
    product = add_product(product)
    print("addded", product)
    # Logic to create a user
    return {"message": "Product created successfully", "data": {"product": product}}


@router.get("/")
def get_products():
    products = get_all_products()

    print(products)

    return {"data": {"products": products}}
