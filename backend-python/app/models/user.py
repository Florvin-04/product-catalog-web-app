from sqlalchemy import Column, Integer, String, Sequence
from db import Base
from pydantic_sqlalchemy import sqlalchemy_to_pydantic


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, Sequence("user_id_seq"), primary_key=True)
    name = Column(String(50))
    email = Column(String(50), unique=True)

    def __repr__(self):
        return f"<User(name={self.name}, email={self.email})>"


UserSchema = sqlalchemy_to_pydantic(User)
user_schema = UserSchema
UserSchemaPayload = sqlalchemy_to_pydantic(User, exclude=["id"])
user_schema_payload = UserSchemaPayload
