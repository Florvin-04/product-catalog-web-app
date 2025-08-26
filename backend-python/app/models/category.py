from db import Base
from sqlalchemy import Column, String, Integer, Sequence, DateTime, func
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from datetime import datetime


class CategoryTable(Base):
    __tablename__ = "categories"

    id = Column(Integer, Sequence("category_id_seq"), primary_key=True)

    name = Column(String(100), nullable=False, unique=True, index=True)

    created_at = Column(
        DateTime(timezone=True), nullable=True, server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=True,
        server_default=func.now(),
        onupdate=func.now(),
    )

    product_categories = relationship(
        "ProductCategoryTable", back_populates="category", cascade="all, delete-orphan"
    )


class CategoryCreateModel(BaseModel):
    name: str


class Category(CategoryCreateModel):
    id: int
    create_at: datetime
    update_at: datetime

    class Config:
        orm_mode = True
