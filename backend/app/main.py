import os

import uvicorn
from api.routers import route
from database import engine
from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import profile

_ = load_dotenv(find_dotenv())  # read local .env file


def create_tables():
    profile.Base.metadata.create_all(bind=engine)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def get_customer_by_name():
    return {"message": "Hello World"}


@app.on_event("startup")
async def on_startup():
    create_tables()


app.include_router(route.router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
