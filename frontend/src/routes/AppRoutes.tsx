import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';

// Public pages
import Home from '@/pages/Home';
import Login from '@/features/auth/pages/Login';
import Register from '@/features/auth/pages/Register';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import ResetPassword from '@/features/auth/pages/ResetPassword';
import PendingApproval from '@/features/auth/pages/PendingApproval';
import NotFound from '@/pages/NotFound';

// Doctor pages
import PatientList from '@/features/patients/pages/PatientList';
import PatientForm from '@/features/patients/pages/PatientForm';
import PatientDetail from '@/features/patients/pages/PatientDetail';
import PredictionForm from '@/features/predictions/pages/PredictionForm';
import PredictionHistory from '@/features/predictions/pages/PredictionHistory';
import PredictionDetail from '@/features/predictions/pages/PredictionDetail';

// EMR pages
import ConsultationList from '@/features/emr/pages/ConsultationList';
import ConsultationForm from '@/features/emr/pages/ConsultationForm';
import ConsultationDetail from '@/features/emr/pages/ConsultationDetail';
import DiagnosisForm from '@/features/emr/pages/DiagnosisForm';
import PrescriptionForm from '@/features/emr/pages/PrescriptionForm';
import TreatmentNoteForm from '@/features/emr/pages/TreatmentNoteForm';
import PatientTimeline from '@/features/emr/pages/PatientTimeline';

// Patient pages
import Profile from '@/features/profile/pages/Profile';
import MyPredictions from '@/features/profile/pages/MyPredictions';
import RiskReports from '@/features/profile/pages/RiskReports';

// Appointment pages
import AppointmentBooking from '@/features/appointments/pages/AppointmentBooking';
import AppointmentList from '@/features/appointments/pages/AppointmentList';
import AppointmentDetail from '@/features/appointments/pages/AppointmentDetail';
import DoctorSchedule from '@/features/appointments/pages/DoctorSchedule';
import DoctorQueueDashboard from '@/features/appointments/pages/DoctorQueueDashboard';
import PatientAppointments from '@/features/appointments/pages/PatientAppointments';
import AppointmentAnalytics from '@/features/appointments/pages/AppointmentAnalytics';
import DoctorAvailabilityManager from '@/features/appointments/pages/DoctorAvailabilityManager';

// Admin pages
import AnalyticsPage from '@/features/admin/pages/Analytics';
import DoctorApprovals from '@/features/admin/pages/DoctorApprovals';
import UserManagement from '@/features/admin/pages/UserManagement';
import SystemReports from '@/features/admin/pages/SystemReports';
import StaffList from '@/features/admin/pages/staff/StaffList';

function DashboardRedirect() {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'SUPER_ADMIN':
    case 'HOSPITAL_ADMIN': return <Navigate to="/admin/analytics" replace />;
    case 'RECEPTIONIST': return <Navigate to="/patients" replace />;
    case 'DOCTOR':
      return user.staffStatus === 'APPROVED'
        ? <Navigate to="/patients" replace />
        : <Navigate to="/pending-approval" replace />;
    case 'PATIENT': return <Navigate to="/me/profile" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        {/* Doctor / Hospital Admin / Receptionist Routes */}
        <Route path="/patients" element={<RoleProtectedRoute roles={['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST']}><PatientList /></RoleProtectedRoute>} />
        <Route path="/patients/new" element={<RoleProtectedRoute roles={['RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN']}><PatientForm /></RoleProtectedRoute>} />
        <Route path="/patients/:id" element={<RoleProtectedRoute roles={['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'PATIENT']}><PatientDetail /></RoleProtectedRoute>} />
        <Route path="/patients/:id/edit" element={<RoleProtectedRoute roles={['DOCTOR', 'RECEPTIONIST', 'HOSPITAL_ADMIN']}><PatientForm /></RoleProtectedRoute>} />
        <Route path="/patients/:id/predict" element={<RoleProtectedRoute roles={['DOCTOR']}><PredictionForm /></RoleProtectedRoute>} />
        <Route path="/patients/:id/medical-history" element={<RoleProtectedRoute roles={['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT']}><PatientTimeline /></RoleProtectedRoute>} />
        <Route path="/predictions" element={<RoleProtectedRoute roles={['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN']}><PredictionHistory /></RoleProtectedRoute>} />
        <Route path="/predictions/:id" element={<RoleProtectedRoute roles={['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT']}><PredictionDetail /></RoleProtectedRoute>} />

        {/* EMR Routes */}
        <Route path="/consultations" element={<RoleProtectedRoute roles={['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT']}><ConsultationList /></RoleProtectedRoute>} />
        <Route path="/consultations/new" element={<RoleProtectedRoute roles={['DOCTOR']}><ConsultationForm /></RoleProtectedRoute>} />
        <Route path="/consultations/:id" element={<RoleProtectedRoute roles={['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT']}><ConsultationDetail /></RoleProtectedRoute>} />
        <Route path="/consultations/:id/diagnoses/new" element={<RoleProtectedRoute roles={['DOCTOR']}><DiagnosisForm /></RoleProtectedRoute>} />
        <Route path="/consultations/:id/prescriptions/new" element={<RoleProtectedRoute roles={['DOCTOR']}><PrescriptionForm /></RoleProtectedRoute>} />
        <Route path="/consultations/:id/notes/new" element={<RoleProtectedRoute roles={['DOCTOR']}><TreatmentNoteForm /></RoleProtectedRoute>} />

        {/* Patient routes */}
        <Route path="/me/profile" element={<RoleProtectedRoute roles={['PATIENT']}><Profile /></RoleProtectedRoute>} />
        <Route path="/me/predictions" element={<RoleProtectedRoute roles={['PATIENT']}><MyPredictions /></RoleProtectedRoute>} />
        <Route path="/me/reports" element={<RoleProtectedRoute roles={['PATIENT']}><RiskReports /></RoleProtectedRoute>} />
        <Route path="/me/medical-history" element={<RoleProtectedRoute roles={['PATIENT']}><PatientTimeline /></RoleProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/analytics" element={<RoleProtectedRoute roles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}><AnalyticsPage /></RoleProtectedRoute>} />
        <Route path="/admin/approvals" element={<RoleProtectedRoute roles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}><DoctorApprovals /></RoleProtectedRoute>} />
        <Route path="/admin/users" element={<RoleProtectedRoute roles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}><UserManagement /></RoleProtectedRoute>} />
        <Route path="/admin/reports" element={<RoleProtectedRoute roles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}><SystemReports /></RoleProtectedRoute>} />
        
        {/* Staff Management Routes */}
        <Route path="/admin/staff/doctors" element={<RoleProtectedRoute roles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}><StaffList type="doctors" title="Doctors" /></RoleProtectedRoute>} />
        <Route path="/admin/staff/receptionists" element={<RoleProtectedRoute roles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}><StaffList type="receptionists" title="Receptionists" /></RoleProtectedRoute>} />
        <Route path="/admin/staff/technicians" element={<RoleProtectedRoute roles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}><StaffList type="technicians" title="Technicians" /></RoleProtectedRoute>} />

        {/* Appointment & Queue Routes */}
        <Route path="/appointments" element={<RoleProtectedRoute roles={['RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN']}><AppointmentList /></RoleProtectedRoute>} />
        <Route path="/appointments/new" element={<RoleProtectedRoute roles={['RECEPTIONIST', 'HOSPITAL_ADMIN', 'SUPER_ADMIN']}><AppointmentBooking /></RoleProtectedRoute>} />
        <Route path="/appointments/:id" element={<RoleProtectedRoute roles={['RECEPTIONIST', 'DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT']}><AppointmentDetail /></RoleProtectedRoute>} />
        
        <Route path="/doctor/schedule" element={<RoleProtectedRoute roles={['DOCTOR']}><DoctorSchedule /></RoleProtectedRoute>} />
        <Route path="/doctor/queue" element={<RoleProtectedRoute roles={['DOCTOR']}><DoctorQueueDashboard /></RoleProtectedRoute>} />
        
        <Route path="/me/appointments" element={<RoleProtectedRoute roles={['PATIENT']}><PatientAppointments /></RoleProtectedRoute>} />
        
        <Route path="/admin/appointment-analytics" element={<RoleProtectedRoute roles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}><AppointmentAnalytics /></RoleProtectedRoute>} />
        <Route path="/admin/availability" element={<RoleProtectedRoute roles={['SUPER_ADMIN', 'HOSPITAL_ADMIN']}><DoctorAvailabilityManager /></RoleProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
