"""Model loading and inference with SHAP explanations."""

import json
import logging
import os
from typing import Optional

import joblib
import numpy as np
import shap

from .schemas import PredictRequest, PredictResponse, Contribution, ModelInfoResponse


logger = logging.getLogger("privhealth-ml")

FEATURES = ["age", "blood_pressure", "cholesterol", "diabetes", "bmi", "heart_rate"]

_model = None
_explainer = None
_metrics: Optional[dict] = None


def load_model():
    """Load model and create SHAP explainer at startup."""
    global _model, _explainer, _metrics

    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model")
    model_path = os.path.join(model_dir, "model.joblib")

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model file not found at {model_path}. Run 'python training/train.py' first."
        )

    data = joblib.load(model_path)
    _model = data["model"]
    _explainer = shap.TreeExplainer(_model)
    logger.info("Model loaded from %s", model_path)

    # Load metrics if available
    metrics_path = os.path.join(model_dir, "metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            _metrics = json.load(f)
        logger.info("Model metrics loaded: %s", _metrics)
    else:
        logger.warning("No metrics.json found — model-info will omit metrics")


def is_loaded() -> bool:
    return _model is not None


def get_model_info() -> ModelInfoResponse:
    """Return model metadata and training metrics."""
    if _model is None:
        raise RuntimeError("Model not loaded")

    return ModelInfoResponse(
        model_type=type(_model).__name__,
        n_estimators=_model.n_estimators,
        max_depth=_model.max_depth,
        features=FEATURES,
        metrics=_metrics,
    )


def predict_with_shap(request: PredictRequest) -> PredictResponse:
    """Run prediction and compute SHAP values."""
    if _model is None:
        raise RuntimeError("Model not loaded")

    X = np.array([[
        request.age,
        request.blood_pressure,
        request.cholesterol,
        request.diabetes,
        request.bmi,
        request.heart_rate,
    ]])

    # Risk score = P(class=1)
    risk_score = round(float(_model.predict_proba(X)[0][1]), 4)

    # Category
    if risk_score < 0.33:
        risk_category = "LOW"
    elif risk_score <= 0.66:
        risk_category = "MODERATE"
    else:
        risk_category = "HIGH"

    # SHAP values
    shap_values = _explainer.shap_values(X)

    # Handle shap API variations: list (binary) vs ndarray
    if isinstance(shap_values, list):
        # Binary classification: take class 1 values
        sv = shap_values[1][0]
    elif isinstance(shap_values, np.ndarray):
        if shap_values.ndim == 3:
            sv = shap_values[0, :, 1]
        else:
            sv = shap_values[0]
    else:
        sv = np.zeros(len(FEATURES))

    # Base value (expected value for class 1)
    base_val = _explainer.expected_value
    if isinstance(base_val, (list, np.ndarray)):
        base_value = round(float(base_val[1]), 4)
    else:
        base_value = round(float(base_val), 4)

    # Build contributions sorted by |value| desc
    contributions = []
    for i, feature in enumerate(FEATURES):
        contributions.append(Contribution(
            feature=feature,
            value=round(float(sv[i]), 4),
        ))

    contributions.sort(key=lambda c: abs(c.value), reverse=True)

    return PredictResponse(
        risk_score=risk_score,
        risk_category=risk_category,
        base_value=base_value,
        contributions=contributions,
    )
