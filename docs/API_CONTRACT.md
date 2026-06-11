# API_CONTRACT.md — Authoritative Endpoint Specification

Base URL: `/api`. All bodies are JSON. All timestamps ISO-8601 UTC.
This file wins over any other doc if shapes conflict.

---

## §1. Response Envelope (every endpoint)

Success:
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": { },
  "meta": null,
  "timestamp": "2026-06-10T10:15:30Z"
}
```

Paginated success — `meta`:
```json
{ "page": 0, "size": 20, "totalElements": 134, "totalPages": 7 }
```

Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [ { "field": "age", "message": "must be between 0 and 120" } ]
  },
  "timestamp": "2026-06-10T10:15:30Z"
}
```

Error codes (HTTP → code):
| HTTP | code |
|---|---|
| 400 | `VALIDATION_ERROR`, `BAD_REQUEST` |
| 401 | `INVALID_CREDENTIALS`, `TOKEN_EXPIRED`, `TOKEN_INVALID`, `UNAUTHORIZED` |
| 403 | `ACCESS_DENIED`, `DOCTOR_NOT_APPROVED` |
| 404 | `RESOURCE_NOT_FOUND` |
| 409 | `EMAIL_ALREADY_EXISTS`, `CONFLICT` |
| 500 | `INTERNAL_ERROR`, `DATA_INTEGRITY_VIOLATION` |
| 503 | `ML_SERVICE_UNAVAILABLE` |

Auth header for protected endpoints: `Authorization: Bearer <jwt>`.

---

## §2. Authentication

### POST /api/auth/register  (public)
Request:
```json
{
  "name": "Dr. Asha Rao",
  "email": "asha@hospital.com",
  "password": "Str0ng!Pass",
  "role": "DOCTOR"
}
```
Rules: `role` ∈ {`DOCTOR`,`PATIENT`} (never ADMIN via API). Password ≥ 8 chars,
1 upper, 1 digit. Doctors get `doctorStatus: PENDING`; patients `null`.

Response `201` data:
```json
{ "id": 12, "name": "Dr. Asha Rao", "email": "asha@hospital.com",
  "role": "DOCTOR", "doctorStatus": "PENDING", "createdAt": "..." }
```
Errors: 409 `EMAIL_ALREADY_EXISTS`, 400 `VALIDATION_ERROR`.

### POST /api/auth/login  (public)
Request: `{ "email": "...", "password": "..." }`
Response `200` data:
```json
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": { "id": 12, "name": "...", "email": "...", "role": "DOCTOR", "doctorStatus": "APPROVED" }
}
```
Notes: PENDING/REJECTED doctors CAN log in (so they can see status screen);
doctor-only endpoints reject them with 403 `DOCTOR_NOT_APPROVED`.

### GET /api/auth/me  (any authenticated)
Response data = user object above.

### POST /api/auth/forgot-password (public)
Request: `{ "email": "..." }` → always `200` ("If the email exists, a reset link was sent")
to avoid user enumeration. Reset token logged/stubbed locally.

### POST /api/auth/reset-password (public)
Request: `{ "token": "...", "newPassword": "..." }` → `200` or 400 `TOKEN_INVALID`.

---

## §3. Patients

`PatientResponse`:
```json
{
  "id": 7, "doctorId": 12, "doctorName": "Dr. Asha Rao",
  "name": "Ravi Kumar", "age": 54, "gender": "MALE",
  "medicalHistory": "Type 2 diabetes since 2019; hypertension.",
  "createdAt": "..."
}
```
(`medicalHistory` is decrypted server-side; ciphertext never leaves the API.)

| Method & Path | Roles | Notes |
|---|---|---|
| POST `/api/patients` | DOCTOR(approved) | Body: `{name, age, gender, medicalHistory, userEmail?}`. `gender` ∈ MALE/FEMALE/OTHER. `userEmail` optionally links an existing PATIENT user. 201. |
| GET `/api/patients?page&size&search` | DOCTOR → own; ADMIN → all | Paginated. `search` matches name (case-insensitive contains). |
| GET `/api/patients/{id}` | owner DOCTOR, ADMIN, linked PATIENT | 404 for other doctors. |
| PUT `/api/patients/{id}` | owner DOCTOR | Same body as POST (full update). |
| DELETE `/api/patients/{id}` | owner DOCTOR, ADMIN | 204-style success envelope; cascades predictions + explanations. |

---

## §4. Predictions

`PredictionResponse`:
```json
{
  "id": 31, "patientId": 7, "patientName": "Ravi Kumar",
  "riskScore": 0.82, "riskCategory": "HIGH",
  "input": { "age": 54, "bloodPressure": 150, "cholesterol": 260,
              "diabetes": true, "bmi": 31.2, "heartRate": 88 },
  "createdAt": "..."
}
```

| Method & Path | Roles | Notes |
|---|---|---|
| POST `/api/predictions` | DOCTOR(approved, owner) | Body: `{ "patientId": 7, "age", "bloodPressure", "cholesterol", "diabetes", "bmi", "heartRate" }`. Validation: age 0–120, bp 60–250, chol 80–500, bmi 10–60, hr 30–220. Calls ML service, persists prediction + explanations atomically. Returns PredictionResponse **with** `explanations` array embedded. |
| GET `/api/predictions?page&size` | DOCTOR → own patients; ADMIN → all; PATIENT → self | Paginated, newest first. |
| GET `/api/predictions/{id}` | scope as above | |
| GET `/api/predictions/patient/{patientId}` | owner DOCTOR, ADMIN, linked PATIENT | List, newest first. |
| DELETE `/api/predictions/{id}` | owner DOCTOR, ADMIN | Deletes explanations too. |

Risk categories: score < 0.33 → `LOW`; 0.33–0.66 → `MODERATE`; > 0.66 → `HIGH`.

---

## §5. Explainability

### GET /api/explanations/{predictionId}
Scope: same as the prediction. Response data:
```json
{
  "predictionId": 31,
  "riskScore": 0.82,
  "riskCategory": "HIGH",
  "baseValue": 0.41,
  "contributions": [
    { "featureName": "cholesterol", "contribution": 0.35 },
    { "featureName": "age",         "contribution": 0.22 },
    { "featureName": "bmi",         "contribution": 0.15 },
    { "featureName": "bloodPressure","contribution": 0.11 },
    { "featureName": "heartRate",   "contribution": -0.03 },
    { "featureName": "diabetes",    "contribution": 0.02 }
  ]
}
```
Ordered by `|contribution|` descending. Negative = pushes risk down.

---

## §6. Admin (role ADMIN only)

| Method & Path | Notes |
|---|---|
| GET `/api/admin/doctors/pending` | List of users with role DOCTOR, status PENDING. |
| PUT `/api/admin/doctors/{id}/approve` | Sets APPROVED. 404 if not a pending doctor. |
| PUT `/api/admin/doctors/{id}/reject` | Sets REJECTED. |
| GET `/api/admin/users?role&page&size` | All users, optional role filter. |
| DELETE `/api/admin/users/{id}` | Cannot delete self or last admin → 409 `CONFLICT`. |
| GET `/api/admin/analytics` | See below. |
| GET `/api/admin/audit-logs?page&size&userId` | Paginated audit trail, newest first. |

Analytics response data:
```json
{
  "totalUsers": 42, "totalDoctors": 10, "pendingDoctors": 2,
  "totalPatients": 120, "totalPredictions": 560,
  "riskDistribution": { "LOW": 300, "MODERATE": 180, "HIGH": 80 },
  "predictionsLast30Days": [ { "date": "2026-06-01", "count": 14 }, ... ]
}
```

---

## §7. ML Service Internal API (FastAPI, not exposed publicly)

### POST /predict
Request:
```json
{ "age": 54, "blood_pressure": 150, "cholesterol": 260,
  "diabetes": 1, "bmi": 31.2, "heart_rate": 88 }
```
Response:
```json
{
  "risk_score": 0.82,
  "risk_category": "HIGH",
  "base_value": 0.41,
  "contributions": [
    { "feature": "cholesterol", "value": 0.35 },
    { "feature": "age", "value": 0.22 },
    { "feature": "bmi", "value": 0.15 },
    { "feature": "blood_pressure", "value": 0.11 },
    { "feature": "heart_rate", "value": -0.03 },
    { "feature": "diabetes", "value": 0.02 }
  ]
}
```
### GET /health → `{ "status": "ok", "model_loaded": true }`

Backend maps snake_case ↔ camelCase in `ml/dto`.
