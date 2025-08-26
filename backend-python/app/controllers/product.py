from db import Session
from models import (
    ProductTable,
    Product,
    ProductCreateModel,
    CategoryTable,
    ProductCategoryTable,
)
from sqlalchemy.orm import joinedload, Session as SessionType
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional


def get_product_with_categories(product_id: int):
    with Session() as session:
        product: Optional[ProductTable] = (
            session.query(ProductTable)
            .options(
                joinedload(ProductTable.product_categories).joinedload(
                    ProductCategoryTable.category
                )
            )
            .filter(ProductTable.id == product_id)
            .first()
        )

        # product_schema = Product.from_orm(product)
        # print(f"schema {product_schema.dict()}")

        print(f"val {product}")

        val = {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "categories": [
                {"id": pc.category.id, "name": pc.category.name}
                for pc in product.product_categories
            ],
        }

        return val


def add_product(product: ProductCreateModel):
    new_product = None
    try:
        with Session() as session:

            existing_product = (
                session.query(ProductTable)
                .filter(ProductTable.name == product.name)
                .first()
            )

            if existing_product:
                raise HTTPException(status_code=400, detail="Product already exists")

            categories = (
                session.query(CategoryTable)
                .filter(CategoryTable.id.in_(product.categorires))
                .all()
            )

            new_product = ProductTable(name=product.name, price=product.price)

            if not categories:
                raise HTTPException(status_code=400, detail="Inavlid Categories")

            new_product.product_categories.extend(
                [ProductCategoryTable(category=cat) for cat in categories]
            )
            session.add(new_product)
            session.flush()  # assign IDs but don’t commit yet

            print(f"id {new_product.id}")

            session.commit()
            session.refresh(new_product)
            product_with_categories = get_product_with_categories(new_product.id)
            # print(f"payload {product}")
            # print("new product", new_product)

            # print(f"cat {product_with_categories}")
            # return product_with_categories

            return {
                "id": new_product.id,
                "name": new_product.name,
                "price": new_product.price,
                "created_at": new_product.create_at,
                "updated_at": new_product.update_at,
                "categories": product_with_categories["categories"],
            }

    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    except Exception as e:
        # if new_product and new_product.id:
        #     delete_product(new_product)
        # else:
        #     session.rollback()

        session.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


def delete_product(product: ProductTable):
    try:
        with Session() as session:
            product_in_db = session.get(ProductTable, product.id)

            if not product:
                raise HTTPException(status_code=404, detail="Product not found")

            session.delete(product_in_db)
            session.commit()

            return {"detail": "Product deleted successfully"}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def get_all_products() -> list[Product]:
    """
    Fetch all products from the database.
    """
    try:
        with Session() as session:
            products = session.query(ProductTable).all()

            products: list[Product] = [
                Product.from_orm(p).dict()
                | {
                    "create_at": Product.from_orm(p).create_at.isoformat(),
                    "update_at": Product.from_orm(p).update_at.isoformat(),
                }
                for p in products
            ]

        return products
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
