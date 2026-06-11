import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PatientSummary, Patient, PatientRequest, PatientSelfUpdateRequest, AssignDoctorRequest } from '@/types/patient';
import type { PageMeta } from '@/types/api';
import { patientApi } from '@/api/patientApi';
import { extractErrorMessage } from '@/api/axios';

interface PatientState {
  list: PatientSummary[];
  selected: Patient | null;
  myProfile: Patient | null;
  meta: PageMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PatientState = {
  list: [],
  selected: null,
  myProfile: null,
  meta: null,
  status: 'idle',
  error: null,
};

export const fetchPatients = createAsyncThunk(
  'patients/fetchAll',
  async (params: { page?: number; size?: number; search?: string }, { rejectWithValue }) => {
    try {
      const res = await patientApi.list(params);
      return { data: res.data.data, meta: res.data.meta ?? null };
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const fetchPatient = createAsyncThunk(
  'patients/fetchOne',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await patientApi.get(id);
      return res.data.data;
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const createPatient = createAsyncThunk(
  'patients/create',
  async (data: PatientRequest, { rejectWithValue }) => {
    try {
      const res = await patientApi.create(data);
      return res.data.data;
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/update',
  async ({ id, data }: { id: number; data: PatientRequest }, { rejectWithValue }) => {
    try {
      const res = await patientApi.update(id, data);
      return res.data.data;
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const deletePatient = createAsyncThunk(
  'patients/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await patientApi.remove(id);
      return id;
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const assignDoctor = createAsyncThunk(
  'patients/assignDoctor',
  async ({ id, data }: { id: number; data: AssignDoctorRequest }, { rejectWithValue }) => {
    try {
      await patientApi.assignDoctor(id, data);
      return { id, doctorId: data.doctorId };
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const fetchMyProfile = createAsyncThunk(
  'patients/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await patientApi.getMyProfile();
      return res.data.data;
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const updateMyProfile = createAsyncThunk(
  'patients/updateMyProfile',
  async (data: PatientSelfUpdateRequest, { rejectWithValue }) => {
    try {
      const res = await patientApi.updateMyProfile(data);
      return res.data.data;
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearSelected(state) { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchPatient.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPatient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchPatient.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(updatePatient.fulfilled, (state) => { state.status = 'succeeded'; })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload);
      })
      .addCase(fetchMyProfile.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myProfile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload;
      });
  },
});

export const { clearSelected } = patientSlice.actions;
export default patientSlice.reducer;
