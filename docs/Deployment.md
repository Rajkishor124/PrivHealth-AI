# PrivHealth AI - Deployment Guide

## 1. Local Deployment (Docker Compose)
The easiest way to run the entire stack locally is using Docker Compose. This ensures PostgreSQL, the Backend, the ML Service, and the Frontend start in the correct order.

```bash
docker compose up --build -d
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- ML Service: `http://localhost:8000`

## 2. Environment Variables
To deploy in a production environment, you must override these variables:
- `JWT_SECRET`: Base64 encoded string (at least 256-bit).
- `AES_KEY`: Base64 encoded string (exactly 32 bytes when decoded, for AES-256).
- `HMAC_KEY`: Base64 encoded string (at least 32 bytes).
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`: Target PostgreSQL connection.
- `CORS_ALLOWED_ORIGINS`: Target frontend domains.

## 3. Platform Deployments
The repositories are structured to easily deploy on modern PaaS providers.

### Render / Railway (Backend & ML)
- Link the repository to Render.
- Create a **Web Service** for Backend. Specify the root folder as `backend/` and use the provided Dockerfile. Set `SPRING_PROFILES_ACTIVE=prod`.
- Create a **Web Service** for ML Service. Specify the root folder as `ml-service/` and use the Dockerfile.

### Vercel / Netlify (Frontend)
- Link the repository to Vercel.
- Framework: Vite.
- Root Directory: `frontend/`
- Build Command: `npm run build`
- Environment Variables: set `VITE_API_URL` to your deployed Backend URL.

### Database (Neon / Supabase)
- Create a Postgres 16+ database.
- Obtain the connection string and populate the `DB_URL` environment variable for your Backend.
