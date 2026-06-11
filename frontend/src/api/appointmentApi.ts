import api from './axios';
import type { ApiResponse, PaginatedData } from '@/types/api';
import type {
  DoctorAvailability, DoctorAvailabilityRequest,
  Appointment, AppointmentRequest, RescheduleRequest,
  PatientQueueEntry, QueueDashboard, AppointmentAnalytics
} from '@/types/appointment';

// ── Doctor Availability ──
export const setDoctorAvailability = (data: DoctorAvailabilityRequest) =>
  api.post<ApiResponse<DoctorAvailability>>('/doctor-availability', data);

export const getDoctorAvailability = (doctorId: number) =>
  api.get<ApiResponse<DoctorAvailability[]>>(`/doctor-availability/doctor/${doctorId}`);

export const getHospitalAvailability = () =>
  api.get<ApiResponse<DoctorAvailability[]>>('/doctor-availability');

export const deleteAvailability = (id: number) =>
  api.delete<ApiResponse<void>>(`/doctor-availability/${id}`);

// ── Appointments ──
export const createAppointment = (data: AppointmentRequest) =>
  api.post<ApiResponse<Appointment>>('/appointments', data);

export const getAppointments = (page = 0, size = 20, date?: string, status?: string) =>
  api.get<ApiResponse<PaginatedData<Appointment>>>('/appointments', { params: { page, size, date, status } });

export const getAppointment = (id: number) =>
  api.get<ApiResponse<Appointment>>(`/appointments/${id}`);

export const rescheduleAppointment = (id: number, data: RescheduleRequest) =>
  api.put<ApiResponse<Appointment>>(`/appointments/${id}/reschedule`, data);

export const cancelAppointment = (id: number) =>
  api.put<ApiResponse<Appointment>>(`/appointments/${id}/cancel`);

export const checkInAppointment = (id: number) =>
  api.post<ApiResponse<Appointment>>(`/appointments/${id}/check-in`);

export const getDoctorSchedule = (date?: string) =>
  api.get<ApiResponse<Appointment[]>>('/appointments/doctor/me', { params: { date } });

export const getMyAppointments = (page = 0, size = 20) =>
  api.get<ApiResponse<PaginatedData<Appointment>>>('/appointments/patient/me', { params: { page, size } });

// ── Queue ──
export const getDoctorQueue = () =>
  api.get<ApiResponse<PatientQueueEntry[]>>('/queue/doctor/me');

export const getDoctorQueueDashboard = () =>
  api.get<ApiResponse<QueueDashboard>>('/queue/doctor/me/dashboard');

export const callNextPatient = () =>
  api.post<ApiResponse<PatientQueueEntry>>('/queue/call-next');

export const startQueueConsultation = (queueId: number) =>
  api.post<ApiResponse<PatientQueueEntry>>(`/queue/${queueId}/start-consultation`);

export const completeQueueEntry = (queueId: number) =>
  api.post<ApiResponse<PatientQueueEntry>>(`/queue/${queueId}/complete`);

export const skipQueueEntry = (queueId: number) =>
  api.post<ApiResponse<PatientQueueEntry>>(`/queue/${queueId}/skip`);

export const getAppointmentAnalytics = () =>
  api.get<ApiResponse<AppointmentAnalytics>>('/queue/analytics');
