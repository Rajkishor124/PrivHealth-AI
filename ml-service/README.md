# ml-service/README.md — FastAPI Risk Prediction + SHAP

Python 3.11+ · FastAPI · scikit-learn · shap · joblib · uvicorn · pydantic.

## 1. Layout

```
ml-service/
├── app/
│   ├── main.py          # FastAPI app, /predict, /health
│   ├── schemas.py       # Pydantic request/response models
│   ├── model.py         # load model.joblib + explainer, predict_with_shap()
│   └── config.py
├── training/
│   ├── train.py         # generates synthetic data, trains, saves model.joblib
│   └── data_gen.py
├── model/model.joblib   # committed OR built in Docker (record in DECISIONS.md)
├── requirements.txt
├── Dockerfile
└── .env.example
```

`requirements.txt`: fastapi, uvicorn[standard], scikit-learn, shap, joblib, numpy,
pandas, pydantic, pydantic-settings.

## 2. Synthetic training data (data_gen.py)

Generate ~10,000 rows. Features (exact order — this order is the model contract):
`["age","blood_pressure","cholesterol","diabetes","bmi","heart_rate"]`

Sampling: age U(18,90); blood_pressure N(125,20) clipped 80–220; cholesterol N(200,40)
clipped 100–400; diabetes Bernoulli(0.2); bmi N(26,5) clipped 15–50; heart_rate N(75,12)
clipped 40–180.

Label rule (logistic ground truth + noise) — risk increases with age, bp, cholesterol,
bmi, diabetes; mild with heart_rate:
```
z = 0.045*(age-50) + 0.02*(bp-120) + 0.012*(chol-200)
  + 0.09*(bmi-25) + 1.1*diabetes + 0.012*(hr-75) - 0.4
p = sigmoid(z); label = Bernoulli(p)
```
Set `random_state=42` everywhere for reproducibility.

## 3. train.py

- `RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42)`.
- Train/test split 80/20, print accuracy + AUC (expect AUC > 0.85).
- Save `{"model": clf, "features": FEATURES}` via joblib to `model/model.joblib`.

## 4. Inference (model.py)

- Load model once at startup; create `shap.TreeExplainer(model)` once.
- `risk_score = model.predict_proba(X)[0][1]` (probability of class 1), rounded 4 dp.
- Category (MUST match backend): `score < 0.33 → LOW`, `score <= 0.66 → MODERATE`,
  `else HIGH`.
- SHAP: `explainer.shap_values(X)` — take class-1 array; `base_value` = class-1 expected
  value. Return per-feature contributions (4 dp), sorted by |value| desc.
- Handle shap API variations (list vs ndarray return) defensively.

## 5. API (must match API_CONTRACT.md §7 exactly)

- `POST /predict` — pydantic validation: age 0–120, blood_pressure 60–250,
  cholesterol 80–500, diabetes 0/1 (accept bool), bmi 10–60, heart_rate 30–220.
  422 on invalid (FastAPI default is fine; backend treats non-200 as ML failure only for
  5xx — backend validates first, so 422 here is a safety net).
- `GET /health` → `{"status":"ok","model_loaded":true}`.

## 6. Run & deploy

Local: `python training/train.py && uvicorn app.main:app --port 8000`.
Dockerfile: slim Python image, run train.py during build (or copy committed model),
`CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT` for Render.

## 7. Tests
- pytest: predict endpoint shape, category thresholds at 0.33/0.66 boundaries
  (monkeypatch predict_proba), validation errors, contributions sorted by magnitude.
