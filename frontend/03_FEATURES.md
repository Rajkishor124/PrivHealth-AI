# frontend/03_FEATURES.md — Feature Slices, Pages, Types

## Shared domain types (types/)

```ts
// user.ts / auth.ts
export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT';
export type DoctorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;
export interface User { id: number; name: string; email: string; role: Role;
  doctorStatus: DoctorStatus; createdAt?: string; }
export interface LoginResponse { accessToken: string; tokenType: string;
  expiresIn: number; user: User; }

// patient.ts
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export interface Patient { id: number; doctorId: number; doctorName?: string;
  name: string; age: number; gender: Gender; medicalHistory: string; createdAt: string; }
export interface PatientSummary { id: number; name: string; age: number; gender: Gender;
  createdAt: string; lastRiskCategory?: RiskCategory | null; }
export interface PatientRequest { name: string; age: number; gender: Gender;
  medicalHistory: string; userEmail?: string; }

// prediction.ts
export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH';
export interface PredictionInput { age: number; bloodPressure: number; cholesterol: number;
  diabetes: boolean; bmi: number; heartRate: number; }
export interface Prediction { id: number; patientId: number; patientName: string;
  riskScore: number; riskCategory: RiskCategory; input: PredictionInput;
  createdAt: string; explanations?: FeatureContribution[]; }
export interface FeatureContribution { featureName: string; contribution: number; }
export interface Explanation { predictionId: number; riskScore: number;
  riskCategory: RiskCategory; baseValue: number; contributions: FeatureContribution[]; }

// admin.ts
export interface Analytics { totalUsers: number; totalDoctors: number;
  pendingDoctors: number; totalPatients: number; totalPredictions: number;
  riskDistribution: Record<RiskCategory, number>;
  predictionsLast30Days: { date: string; count: number }[]; }
export interface AuditLog { id: number; userId: number | null; userName: string | null;
  action: string; entityType: string | null; entityId: number | null;
  details: string | null; ipAddress: string | null; createdAt: string; }
```

## features/patients (DOCTOR)

- **PatientList**: search input (useDebounce 400ms), paginated Table
  (name, age, gender, last risk Badge, created, actions: view/edit/delete-with-ConfirmDialog,
  "New Prediction" shortcut). Empty state with "Add your first patient" CTA.
- **PatientForm** (create/edit, shared component, Zod schema mirrors backend validation;
  optional `userEmail` field with hint "Link an existing patient account").
- **PatientDetail**: info card + decrypted medical history + prediction list for this
  patient + "Run Prediction" button.
- `patientSlice`: thunks `fetchPatients(params)`, `fetchPatient(id)`, `createPatient`,
  `updatePatient`, `deletePatient`; keeps `list`, `selected`, `meta`, statuses.

## features/predictions (DOCTOR)

- **PredictionForm** (`/patients/:id/predict`): six inputs per `PredictionInput`
  (diabetes = toggle). Zod ranges: age 0–120, bp 60–250, chol 80–500, bmi 10–60,
  hr 30–220. Prefill `age` from patient. On submit → result panel: RiskChart (score gauge),
  category Badge, ShapChart of returned explanations, link to detail.
- **PredictionHistory** (`/predictions`): paginated table (patient, score, category Badge,
  date, actions view/delete).
- **PredictionDetail**: inputs summary + RiskChart + ShapChart fed by
  `GET /api/explanations/{id}` + plain-language sentence list:
  "Cholesterol increased the predicted risk by 35%".
- `predictionSlice`: `createPrediction`, `fetchPredictions`, `fetchPrediction`,
  `fetchExplanation`, `deletePrediction`.

## features/profile (PATIENT)

- **Profile**: user info + linked patient record (if any) — fetched via
  `GET /api/patients` scoped response or dedicated `GET /api/auth/me` + patient lookup
  by `GET /api/predictions` patient linkage (simplest: backend exposes patient via
  `/api/patients` returning the linked record for PATIENT role — implement that scope).
- **MyPredictions**: same table as doctor history minus delete.
- **RiskReports**: latest prediction hero card (big category + score) + TrendChart of
  risk score over time + SHAP chart of the latest prediction.

## features/admin (ADMIN)

- **Analytics**: stat cards (users/doctors/pending/patients/predictions),
  riskDistribution donut/bar, predictionsLast30Days line (Recharts).
- **DoctorApprovals**: pending list with Approve/Reject buttons (ConfirmDialog on reject);
  optimistic removal + toast.
- **UserManagement**: paginated users table, role filter tabs, delete with guards
  (errors 409 surfaced via toast).
- **SystemReports**: audit log table (action Badge, user, entity, IP, time), userId filter,
  pagination.
- `adminSlice`: `fetchAnalytics`, `fetchPendingDoctors`, `approveDoctor`, `rejectDoctor`,
  `fetchUsers`, `deleteUser`, `fetchAuditLogs`.

## API layer pattern (api/*.ts)

One function per endpoint, typed:
```ts
export const patientApi = {
  list: (p: { page?: number; size?: number; search?: string }) =>
    axios.get<ApiResponse<PatientSummary[]>>('/patients', { params: p }),
  get: (id: number) => axios.get<ApiResponse<Patient>>(`/patients/${id}`),
  create: (b: PatientRequest) => axios.post<ApiResponse<Patient>>('/patients', b),
  update: (id: number, b: PatientRequest) => axios.put<ApiResponse<Patient>>(`/patients/${id}`, b),
  remove: (id: number) => axios.delete<ApiResponse<null>>(`/patients/${id}`),
};
```
Thunks call these and unwrap `data.data` (+ `data.meta`).
