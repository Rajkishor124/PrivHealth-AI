"""Pydantic request/response schemas for the ML service."""

from pydantic import BaseModel, Field
from typing import List, Optional


class PredictRequest(BaseModel):
    age: int = Field(..., ge=0, le=120, description="Patient age in years")
    blood_pressure: int = Field(..., ge=60, le=250, description="Systolic blood pressure (mmHg)")
    cholesterol: int = Field(..., ge=80, le=500, description="Total cholesterol (mg/dL)")
    diabetes: int = Field(..., ge=0, le=1, description="Diabetes indicator (0=No, 1=Yes)")
    bmi: float = Field(..., ge=10.0, le=60.0, description="Body Mass Index")
    heart_rate: int = Field(..., ge=30, le=220, description="Resting heart rate (bpm)")


class Contribution(BaseModel):
    feature: str
    value: float


class PredictResponse(BaseModel):
    risk_score: float
    risk_category: str
    base_value: float
    contributions: List[Contribution]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


class ModelInfoResponse(BaseModel):
    model_type: str
    n_estimators: int
    max_depth: Optional[int]
    features: List[str]
    metrics: Optional[dict] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
