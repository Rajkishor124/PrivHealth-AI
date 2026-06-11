export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_QUEUE' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type QueueStatus = 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'SKIPPED';

export interface DoctorAvailability {
  id: number;
  doctorId: number;
  doctorName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxAppointmentsPerSlot: number;
  active: boolean;
}

export interface DoctorAvailabilityRequest {
  doctorId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxAppointmentsPerSlot?: number;
  active?: boolean;
}

export interface Appointment {
  id: number;
  appointmentNumber: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit?: string;
  notes?: string;
}

export interface RescheduleRequest {
  appointmentDate: string;
  appointmentTime: string;
}

export interface PatientQueueEntry {
  id: number;
  appointmentId: number;
  appointmentNumber: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  tokenNumber: string;
  queuePosition: number;
  status: QueueStatus;
  checkInTime: string;
  calledTime: string | null;
  consultationStartTime: string | null;
  completedTime: string | null;
  reasonForVisit: string;
}

export interface QueueDashboard {
  totalToday: number;
  waiting: number;
  called: number;
  inConsultation: number;
  completed: number;
  skipped: number;
  currentPatient: PatientQueueEntry | null;
  queue: PatientQueueEntry[];
}

export interface DoctorUtilization {
  doctorId: number;
  doctorName: string;
  totalAppointments: number;
  completed: number;
  waiting: number;
}

export interface AppointmentAnalytics {
  totalAppointments: number;
  todayAppointments: number;
  todayCheckedIn: number;
  todayWaiting: number;
  todayInConsultation: number;
  todayCompleted: number;
  todayCancelled: number;
  todayNoShow: number;
  doctorUtilization: DoctorUtilization[];
}
