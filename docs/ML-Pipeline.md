# PrivHealth AI - ML Pipeline

## 1. Data Generation & Training
- Located in `ml-service/training/`.
- `data_gen.py`: Generates 10,000 synthetic patient records using realistic distributions (Age, Blood Pressure, Cholesterol, Diabetes, BMI, Heart Rate) and a hidden logistic function.
- `train.py`: Trains a `RandomForestClassifier` (n_estimators=200, max_depth=8).
- **Outputs**:
  - `model/model.joblib`: The serialized scikit-learn pipeline.
  - `model/feature_names.json`: Feature ordering guarantee.
  - `model/metrics.json`: Accuracy, Precision, Recall, F1, ROC-AUC.

## 2. Inference
- Served via `FastAPI` on port 8000.
- `load_model()`: Runs at startup, loading the model into memory.
- `predict_with_shap()`:
  1. Formats incoming features into an `ndarray`.
  2. Extracts Probability of Class 1 (`risk_score`).
  3. Maps score to LOW/MODERATE/HIGH category.
  4. Passes data through `shap.TreeExplainer` to calculate exact feature contribution values against the expected base value.
  5. Sorts contributions by absolute magnitude for the UI.

## 3. Resilience
- The Java backend calls the ML service via `RestTemplate`.
- Protected by **Resilience4j**:
  - **Retry**: Automatically retries 1 time if a connection drops.
  - **Circuit Breaker**: Trips if the failure rate exceeds 50% over a 10-call sliding window. Falls back to returning a clean `MlServiceException`.
  - **Timeout**: Enforces a strict 5-second upper bound.
