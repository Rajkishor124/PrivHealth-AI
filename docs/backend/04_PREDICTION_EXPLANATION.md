# backend/04_PREDICTION_EXPLANATION.md — ML Integration, Predictions, SHAP

## ML client (ml/)

`MlClient` using Spring `RestClient` (or WebClient):
- POST `{ML_SERVICE_URL}/predict` with `MlPredictRequest` (snake_case via
  `@JsonProperty` or naming strategy).
- Timeout 5s (props). One retry on connect/timeout errors.
- Any failure → `MlServiceException` → 503 `ML_SERVICE_UNAVAILABLE`.
- Health check used by `/actuator` custom indicator (optional).

DTOs mirror `API_CONTRACT.md §7` exactly.

## PredictionService.create(principal, request)

Transactional flow:
1. Require approved doctor; load patient; verify ownership (else 404).
2. Validate inputs (bean validation per ranges in `API_CONTRACT.md §4`).
3. Call `MlClient.predict(...)` — do this BEFORE persisting anything.
4. Persist `Prediction` (denormalized inputs + score + category from ML response —
   trust ML's category, but assert it matches the threshold rule; mismatch → log WARN
   and recompute from score using backend rule: <0.33 LOW, ≤0.66 MODERATE, else HIGH).
5. Persist `Explanation` rows (featureName camelCase, contribution, baseValue).
6. Audit `PREDICTION_CREATED` (entityId = prediction id; details = riskCategory only).
7. Return `PredictionResponse` with embedded ordered `explanations`.

If ML call succeeds but persistence fails → transaction rolls back; nothing saved.

## Queries / scoping

- `list(principal, pageable)`:
  - ADMIN → all; DOCTOR → `findByPatientDoctorId(principal.id)`;
    PATIENT → `findByPatientUserId(principal.id)`.
- `getById` / `getByPatient` / `delete`: resolve scope first; unauthorized doctor → 404;
  unauthorized patient → 404. Delete allowed for owning doctor or admin; audit
  `PREDICTION_DELETED`.
- Sorting default `createdAt DESC`; join-fetch patient to avoid N+1.

## ExplanationService

`getByPredictionId(principal, predictionId)`:
1. Load prediction (with patient) → apply same scope rules.
2. Load explanations ordered by `ABS(contribution) DESC` (`@Query ... ORDER BY ABS(e.contribution) DESC`).
3. Return shape per `API_CONTRACT.md §5` (baseValue from any row — same for all).

## Tests
- Orchestration happy path with mocked `MlClient` (verify atomic persistence).
- ML failure → 503, zero rows persisted.
- Scope matrix for list/get/delete across three roles.
- Category recomputation when ML category disagrees with score.
