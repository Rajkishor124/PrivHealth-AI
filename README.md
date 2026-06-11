# PrivHealth AI

PrivHealth AI is a production-grade, privacy-preserving healthcare risk prediction platform. It leverages a secure, role-based backend and an interpretable Machine Learning pipeline to provide actionable insights for healthcare professionals while ensuring patient data confidentiality.

![PrivHealth AI](https://img.shields.io/badge/Status-Production_Ready-success)

## Overview

The platform consists of three main components:
1. **Backend**: Java 21, Spring Boot 3.4.5, PostgreSQL, Spring Security (JWT + RBAC). Encrypts medical history at rest using AES-256-GCM.
2. **ML Service**: Python 3.10, FastAPI, Scikit-learn. Generates predictions using a Random Forest model and provides interpretability via SHAP TreeExplainer.
3. **Frontend**: React, Vite, TypeScript, TailwindCSS v4. Provides specialized dashboards for Admins, Doctors, and Patients.

## Documentation

Comprehensive documentation can be found in the `docs/` directory:
- [Architecture](docs/Architecture.md)
- [Security Model](docs/Security.md)
- [ML Pipeline](docs/ML-Pipeline.md)
- [Deployment Guide](docs/Deployment.md)
- [End-to-End Testing Checklist](docs/Testing.md)

## Quick Start (Docker Compose)

The entire application can be spun up locally using Docker Compose.

1. Copy the example environment file and configure your local parameters:
   ```bash
   cp .env.example .env
   ```
2. Build and run the services:
   ```bash
   docker compose up --build -d
   ```

Once running, access the services:
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **ML API**: [http://localhost:8000](http://localhost:8000)

### Default Admin Credentials
When the backend starts for the first time, it automatically provisions an Admin account:
- **Email**: `admin@privhealth.com`
- **Password**: `Admin123`

## Local Development Setup
If you prefer running services directly on your host machine without Docker, refer to the individual service guides:
- [Backend Setup](backend/01_SETUP.md)
- [Frontend Setup](frontend/01_SETUP.md)
- [ML Service Setup](ml-service/README.md)

## Key Features
- **Privacy First**: Patient data is symmetrically encrypted before database insertion.
- **Explainable AI**: Doctors receive exact feature contributions (e.g., "Age +0.12, BMI +0.05") alongside the risk score.
- **Strict Data Ownership**: Doctors can only query their own mapped patients.
- **Resilient Architecture**: Spring Boot communicates with the ML Service via a Circuit Breaker and Retry mechanism.
- **Observability**: Exposes `/actuator/health` and `/actuator/prometheus` for monitoring.
