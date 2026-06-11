# PrivHealth AI - Architecture

## High-Level Design
PrivHealth AI is designed as a secure, three-tier web application, avoiding the overhead of microservices while maintaining strict separation of concerns.

1. **Frontend (Presentation Layer)**
   - React + Vite Single Page Application (SPA).
   - Stateful management via Redux Toolkit.
   - Communicates exclusively with the Spring Boot Backend via REST API.

2. **Backend (Orchestration & Security Layer)**
   - Java 21 + Spring Boot 3.4.5.
   - Serves as the central API Gateway and enforcement point for Role-Based Access Control (RBAC).
   - Manages the PostgreSQL database using Spring Data JPA and Flyway migrations.
   - Encrypts sensitive Patient Data (AES-256-GCM) before it hits the database.
   - Communicates synchronously with the ML Service for predictions, protected by Resilience4j (Circuit Breaker & Retry).

3. **ML Service (Inference Layer)**
   - Python 3.10 + FastAPI.
   - Wraps a pre-trained `scikit-learn` Random Forest model.
   - Uses `SHAP` TreeExplainer to compute feature contributions in real-time.
   - Stateless and independently scalable.

## Request Flow: Prediction Generation
1. Doctor submits prediction form via Frontend UI.
2. Spring Boot verifies JWT and Doctor's ownership of the patient.
3. Spring Boot retrieves encrypted patient data from PostgreSQL and decrypts it.
4. Spring Boot acts as an ML Client, sending a `POST /predict` request to FastAPI.
5. FastAPI loads data into memory, runs `predict_proba()` and `shap_values()`.
6. FastAPI returns Risk Score, Category, and SHAP contributions.
7. Spring Boot persists the prediction result and explanations into PostgreSQL.
8. Spring Boot returns unified DTO to Frontend.
