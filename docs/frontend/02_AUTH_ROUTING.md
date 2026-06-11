# frontend/02_AUTH_ROUTING.md — Auth Flow, Token Handling, Route Protection

## 1. authSlice

State:
```ts
interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  initialized: boolean;   // true after bootstrap /me attempt completes
}
```
Thunks: `login`, `register`, `fetchMe`, `forgotPassword`, `resetPassword`.
Reducer `logout` clears state + token storage.

Bootstrap: on app mount, if token exists → dispatch `fetchMe`; until `initialized`,
ProtectedRoute renders `<Loader fullScreen/>` (prevents redirect flicker on refresh).

## 2. Routing map (AppRoutes.tsx)

```
/                      Home (public landing)
/login /register
/forgot-password /reset-password?token=
/pending-approval      (doctor with status PENDING/REJECTED)

ProtectedRoute (any authenticated) → DashboardLayout
  /dashboard           role-aware redirect:
                       ADMIN → /admin/analytics
                       DOCTOR(APPROVED) → /patients
                       DOCTOR(PENDING|REJECTED) → /pending-approval
                       PATIENT → /me/profile

  RoleProtectedRoute(DOCTOR):
    /patients  /patients/new  /patients/:id  /patients/:id/edit
    /patients/:id/predict     (PredictionForm)
    /predictions              (history)  /predictions/:id (detail + SHAP)

  RoleProtectedRoute(PATIENT):
    /me/profile  /me/predictions  /me/reports

  RoleProtectedRoute(ADMIN):
    /admin/analytics  /admin/approvals  /admin/users  /admin/reports

*                      NotFound
```

## 3. Guards

### ProtectedRoute
- Not initialized → Loader. No user → `<Navigate to="/login" state={{from}} />`.
- After login, navigate back to `state.from` or `/dashboard`.

### RoleProtectedRoute({ roles })
- User role not in `roles` → toast "You don't have access to that page" +
  `<Navigate to="/dashboard"/>`.
- Special doctor rule: role DOCTOR with `doctorStatus !== 'APPROVED'` accessing doctor
  routes → `<Navigate to="/pending-approval"/>`.

## 4. Pages

- **Login**: RHF + Zod (`email`, `password` min 8). On success: store token, set user,
  redirect per role map. On 401 → toast envelope message.
- **Register**: fields name/email/password/confirmPassword/role(DOCTOR|PATIENT radio).
  Zod refine password match + complexity (1 upper, 1 digit). Doctor success → navigate
  `/login` with toast "Registration submitted — pending admin approval". Patient → login.
- **ForgotPassword / ResetPassword**: per contract; reset reads `token` from query.
- **PendingApproval**: status card — PENDING (info) vs REJECTED (error) copy + logout button.

## 5. Sidebar (layout) — role-driven items

| Role | Items |
|---|---|
| DOCTOR | Dashboard, Patients, Predictions |
| PATIENT | Profile, My Predictions, Risk Reports |
| ADMIN | Analytics, Doctor Approvals, Users, System Reports |

Navbar: app name, user name + role badge, logout. Mobile: collapsible sidebar.
