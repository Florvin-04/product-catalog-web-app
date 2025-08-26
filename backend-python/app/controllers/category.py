from models import CategoryTable, CategoryCreateModel
from db import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException


def add_category(category: CategoryCreateModel):
    try:
        with Session() as session:

            existing_category = (
                session.query(CategoryTable)
                .filter(CategoryTable.name == category.name)
                .first()
            )

            print(f"exist", existing_category)

            if existing_category:
                raise HTTPException(
                    status_code=400,
                    detail="Category already exist",
                )

            new_category = CategoryTable(name=category.name)
            session.add(new_category)
            session.commit()
            session.refresh(new_category)
            return new_category
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
