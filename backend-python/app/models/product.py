from sqlalchemy import Column, Integer, String, Sequence, DateTime, func
from sqlalchemy.orm import relationship
from db import Base
from pydantic import BaseModel
from datetime import datetime
from .category import Category
from .product_category import ProductCategoryTable


class ProductTable(Base):
    __tablename__ = "products"
    id = Column(Integer, autoincrement=True, primary_key=True)

    name = Column(String(100), nullable=False, unique=True, index=True)

    price = Column(Integer, nullable=False)

    create_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    update_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    product_categories: list[ProductCategoryTable] = relationship(
        "ProductCategoryTable", back_populates="product", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Product(name={self.name}, price={self.price} categories={self.product_categories})>"


class ProductCreateModel(BaseModel):
    name: str
    price: int
    categorires: list[int] = []


class Product(ProductCreateModel):
    id: int
    create_at: datetime
    update_at: datetime
    product_categories: list[Category] = []

    class Config:
        orm_mode = True
