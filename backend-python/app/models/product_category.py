from db import Base

from sqlalchemy import Column, Integer, String, Sequence, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from datetime import datetime


class ProductCategoryTable(Base):
    __tablename__ = "product_categories"

    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True
    )
    catetory_id = Column(
        Integer, ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True
    )

    create_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    update_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    product = relationship(
        "ProductTable", back_populates="product_categories", passive_deletes=True
    )
    category = relationship(
        "CategoryTable",
        back_populates="product_categories",
    )

    def __repr__(self):
        return f"<ProductCategory(name={self.product_id}, category_id={self.catetory_id})>"
