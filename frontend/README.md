# frontend/README.md — React App Overview

React 18 · Vite · TypeScript (strict) · Tailwind CSS · Redux Toolkit · React Router DOM v6 ·
Axios · React Hook Form + Zod · Recharts · lucide-react · react-hot-toast.

## Folder structure (src/)

```
api/            axios.ts (instance + interceptors), authApi.ts, patientApi.ts,
                predictionApi.ts, adminApi.ts
app/            store.ts (configureStore), hooks.ts (typed useAppDispatch/Selector)
components/
  common/       Button, Input, Select, Textarea, Modal, Table, Loader, Badge,
                EmptyState, ConfirmDialog, Pagination
  layout/       Navbar, Sidebar, Footer
  charts/       RiskChart (gauge/bar of score), ShapChart (horizontal bar),
                TrendChart (predictions over time)
features/
  auth/         pages/ (Login, Register, ForgotPassword, ResetPassword, PendingApproval)
                components/, authSlice.ts
  patients/     pages/ (PatientList, PatientForm[create/edit], PatientDetail)
                components/, patientSlice.ts
  predictions/  pages/ (PredictionForm, PredictionHistory, PredictionDetail[+SHAP])
                components/, predictionSlice.ts
  admin/        pages/ (Analytics, DoctorApprovals, UserManagement, SystemReports)
                components/, adminSlice.ts
  profile/      pages/ (Profile, MyPredictions, RiskReports)  ← patient dashboard
hooks/          useAuth.ts, useRole.ts, useDebounce.ts
layouts/        DashboardLayout.tsx (Navbar+Sidebar+Outlet), AuthLayout.tsx
pages/          Home.tsx (landing), NotFound.tsx
routes/         AppRoutes.tsx, ProtectedRoute.tsx, RoleProtectedRoute.tsx
types/          api.ts (envelope), auth.ts, patient.ts, prediction.ts, user.ts, admin.ts
utils/          constants.ts, token.ts, helpers.ts (formatDate, riskColor)
App.tsx · main.tsx · index.css
```

## Conventions

- Feature-based architecture: pages compose feature components; cross-feature reuse only
  via `components/common`.
- Server state lives in Redux slices via `createAsyncThunk` (status:
  `idle|loading|succeeded|failed` per resource). Forms are local state (RHF).
- Every async screen renders one of: `<Loader/>`, `<EmptyState/>`, error toast + retry,
  or data. No blank screens.
- All API types mirror `API_CONTRACT.md` exactly (see `frontend/03_FEATURES.md` for the
  full type definitions).
- Tailwind only — no CSS modules/styled-components. Design tokens in
  `frontend/04_UI_COMPONENTS.md`.
- Toasts: success on mutations, error on failures (message from envelope).
- `npm run build` must pass with zero TS errors; ESLint + prettier configured.

## Env

`.env.example`: `VITE_API_BASE_URL=http://localhost:8080/api`

Build guides in order: `01_SETUP.md` → `02_AUTH_ROUTING.md` → `03_FEATURES.md` →
`04_UI_COMPONENTS.md`.
