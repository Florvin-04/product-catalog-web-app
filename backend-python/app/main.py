from fastapi import FastAPI
from db import Base, engine
import models
from api import router as api_router 

app = FastAPI()


Base.metadata.create_all(bind=engine)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}
