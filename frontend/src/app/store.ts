import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import patientReducer from '@/features/patients/patientSlice';
import predictionReducer from '@/features/predictions/predictionSlice';
import adminReducer from '@/features/admin/adminSlice';
import emrReducer from '@/features/emr/emrSlice';
import appointmentReducer from '@/features/appointments/appointmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer,
    predictions: predictionReducer,
    admin: adminReducer,
    emr: emrReducer,
    appointments: appointmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
