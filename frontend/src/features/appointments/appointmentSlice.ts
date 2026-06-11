import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/api/appointmentApi';
import type { Appointment, PatientQueueEntry, QueueDashboard, AppointmentAnalytics } from '@/types/appointment';

interface AppointmentState {
  appointments: Appointment[];
  doctorSchedule: Appointment[];
  myAppointments: Appointment[];
  queue: PatientQueueEntry[];
  dashboard: QueueDashboard | null;
  analytics: AppointmentAnalytics | null;
  loading: boolean;
  totalPages: number;
}

const initialState: AppointmentState = {
  appointments: [],
  doctorSchedule: [],
  myAppointments: [],
  queue: [],
  dashboard: null,
  analytics: null,
  loading: false,
  totalPages: 0,
};

export const fetchAppointments = createAsyncThunk('appointments/list',
  async ({ page, size, date, status }: { page?: number; size?: number; date?: string; status?: string }) => {
    const res = await api.getAppointments(page, size, date, status);
    return res.data;
  }
);

export const fetchDoctorSchedule = createAsyncThunk('appointments/doctorSchedule',
  async (date?: string) => {
    const res = await api.getDoctorSchedule(date);
    return res.data;
  }
);

export const fetchMyAppointments = createAsyncThunk('appointments/myAppointments',
  async ({ page, size }: { page?: number; size?: number }) => {
    const res = await api.getMyAppointments(page, size);
    return res.data;
  }
);

export const fetchDoctorQueueDashboard = createAsyncThunk('appointments/queueDashboard',
  async () => {
    const res = await api.getDoctorQueueDashboard();
    return res.data;
  }
);

export const fetchAppointmentAnalytics = createAsyncThunk('appointments/analytics',
  async () => {
    const res = await api.getAppointmentAnalytics();
    return res.data;
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => { state.loading = true; })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data.content;
        state.totalPages = action.payload.data.totalPages ?? action.payload.meta?.totalPages ?? 0;
      })
      .addCase(fetchAppointments.rejected, (state) => { state.loading = false; })

      .addCase(fetchDoctorSchedule.pending, (state) => { state.loading = true; })
      .addCase(fetchDoctorSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorSchedule = action.payload.data;
      })
      .addCase(fetchDoctorSchedule.rejected, (state) => { state.loading = false; })

      .addCase(fetchMyAppointments.pending, (state) => { state.loading = true; })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.myAppointments = action.payload.data.content;
        state.totalPages = action.payload.data.totalPages ?? action.payload.meta?.totalPages ?? 0;
      })
      .addCase(fetchMyAppointments.rejected, (state) => { state.loading = false; })

      .addCase(fetchDoctorQueueDashboard.pending, (state) => { state.loading = true; })
      .addCase(fetchDoctorQueueDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.data;
      })
      .addCase(fetchDoctorQueueDashboard.rejected, (state) => { state.loading = false; })

      .addCase(fetchAppointmentAnalytics.pending, (state) => { state.loading = true; })
      .addCase(fetchAppointmentAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.data;
      })
      .addCase(fetchAppointmentAnalytics.rejected, (state) => { state.loading = false; });
  },
});

export default appointmentSlice.reducer;
