from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import traceback
import uvicorn

from src.schemas import AnalyzeRequest, AnalyzeResponse, HealthResponse
from src import model as ml_model

app = FastAPI(
    title="ClaimDesk ML Service",
    description="ML service for prioritizing insurance claims",
    version="1.0.0"
)

# CORS: allow all for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Load model on startup
    ml_model.load_models()

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        model_loaded=ml_model.MODEL_LOADED,
        version="1.0.0"
    )

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_claim(request: AnalyzeRequest):
    try:
        response = ml_model.predict_priority(request)
        return response
    except Exception as e:
        error_msg = f"Internal server error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail="An error occurred while processing the claim.")

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True, access_log=True)
