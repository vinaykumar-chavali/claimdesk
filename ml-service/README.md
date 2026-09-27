# ClaimDesk ML Service

This is the FastAPI microservice for predicting insurance claim priority using XGBoost.

## Directory Structure
- `src/`: FastAPI app, models, and schemas
- `models/`: Trained model files
- `data/`: Processed datasets
- `Dockerfile`: Container definition
- `requirements.txt`: Python dependencies

## Setup
1. Train the model using the scripts in `../scripts/`
2. Run the server: `uvicorn src.main:app --reload`
