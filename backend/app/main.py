import uvicorn
from api.routers.route import (
    followup_router,
    patient_router,
    syphilis_case_router,
    treatment_router,
)
from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

_ = load_dotenv(find_dotenv())


app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


app.include_router(patient_router)
app.include_router(syphilis_case_router)
app.include_router(treatment_router)
app.include_router(followup_router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
