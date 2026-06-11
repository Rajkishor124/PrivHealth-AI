# PrivHealth AI

PrivHealth AI is a multi-tenant Hospital Management System with privacy-preserving electronic medical records (EMR), appointment scheduling, queuing, and patient health tracking.

## Features

- **Multi-Tenant Foundation**: Secure isolation for multiple hospitals.
- **Hospital Staff Management**: RBAC for Admins, Doctors, Receptionists, and Technicians.
- **Patient Registration & Assignment**: Complete patient flow from registration to doctor assignment.
- **Electronic Medical Records (EMR)**: Manage diagnoses, prescriptions, treatment notes, and medical reports.
- **Appointment Scheduling & Queue**: Doctor schedules, patient bookings, and an interactive daily queue dashboard.
- **Patient Health Tracking**: Longitudinal tracking of patient symptoms, vitals, and health journals with a unified medical timeline.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Redux Toolkit
- **Backend**: Java 21, Spring Boot 3, Spring Security, Hibernate
- **Database**: PostgreSQL
- **Security**: JWT Authentication, Field-level Encryption (AES/HMAC)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Java 21
- PostgreSQL
- Maven

### Backend Setup
1. Navigate to the `backend` directory.
2. Copy `.env.example` to `.env` and fill in your database credentials and secret keys.
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Copy `.env.example` to `.env`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## License

All rights reserved.
