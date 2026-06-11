# PrivHealth AI - End-to-End Testing Checklist

Use this checklist to manually verify the system before marking a release as production-ready.

## 1. Authentication
- [ ] **Registration**: Register as a PATIENT. Ensure immediate login is possible.
- [ ] **Registration**: Register as a DOCTOR. Ensure you receive the "Account pending approval" state and cannot access doctor routes.
- [ ] **Login**: Login with correct credentials. Verify token is stored and dashboard loads.
- [ ] **Login Fail**: Login with bad credentials. Verify "Invalid email or password" toast.
- [ ] **Role Protection**: Try to navigate to `/admin` as a PATIENT. Ensure you are redirected and shown an "Unauthorized" toast.

## 2. Admin Workflow
- [ ] **Login**: Login as `admin@privhealth.com` (password: `Admin123`).
- [ ] **Dashboard**: Verify analytics cards load without errors.
- [ ] **Approval**: Find the newly registered DOCTOR in the pending queue. Click "Approve".
- [ ] **Audit Logs**: Verify the approval action shows up in the System Audit Logs.

## 3. Doctor Workflow
- [ ] **Login**: Login as the newly approved DOCTOR.
- [ ] **Patient Creation**: Create a new patient profile. Verify form validation.
- [ ] **Patient Privacy**: Log out, login as a different doctor, and try to fetch the previous doctor's patient by ID via the API. Verify a 404 response.
- [ ] **Prediction**: Navigate to the patient's file. Enter realistic health metrics and generate a prediction.
- [ ] **SHAP Explainability**: Verify the "Risk Factors" chart renders and shows logical feature contributions.

## 4. Patient Workflow
- [ ] **Login**: Login as a PATIENT.
- [ ] **History**: View prediction history. Verify you only see predictions explicitly linked to your account.

## 5. Resilience
- [ ] **Circuit Breaker**: Stop the ML Service container (`docker stop privhealth-ml`). 
- [ ] **Fallback**: Attempt to generate a prediction. Verify the backend responds gracefully with a "Service Unavailable" error rather than hanging or throwing a 500 stack trace.
