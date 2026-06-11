"""FastAPI ML service for health risk prediction with SHAP explainability."""

import json
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from .model import load_model, is_loaded, predict_with_shap, get_model_info
from .schemas import (
    PredictRequest,
    PredictResponse,
    HealthResponse,
    ModelInfoResponse,
    ErrorResponse,
)

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("privhealth-ml")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model at startup."""
    try:
        load_model()
        logger.info("ML service startup complete — model loaded successfully")
    except FileNotFoundError as e:
        logger.error("Model file not found: %s", e)
        logger.error("Run 'python training/train.py' to generate the model first.")
    except Exception as e:
        logger.error("Failed to load model at startup: %s", e)
    yield
    logger.info("ML service shutting down")


app = FastAPI(
    title="PrivHealth AI — ML Service",
    description="Health risk prediction with SHAP explainability",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"error": "Validation error", "detail": str(exc)},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error("Unhandled error: %s", exc, exc_info=False)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )


@app.post("/predict", response_model=PredictResponse, responses={503: {"model": ErrorResponse}})
async def predict(request: PredictRequest):
    """Predict health risk and return SHAP contributions."""
    if not is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        result = predict_with_shap(request)
        logger.info(
            "Prediction completed: score=%.4f category=%s",
            result.risk_score,
            result.risk_category,
        )
        return result
    except Exception as e:
        logger.error("Prediction failed: %s", e)
        raise HTTPException(status_code=500, detail="Prediction failed")


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(status="ok", model_loaded=is_loaded())


@app.get("/model-info", response_model=ModelInfoResponse, responses={503: {"model": ErrorResponse}})
async def model_info():
    """Return model metadata and training metrics."""
    if not is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")
    return get_model_info()
