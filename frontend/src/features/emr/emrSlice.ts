import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as emrApi from '@/api/emrApi';
import { extractErrorMessage } from '@/api/axios';
import type { 
  Consultation, Diagnosis, Prescription, TreatmentNote, MedicalReport, MedicalTimelineItem 
} from '@/types/emr';
import type { PaginatedData } from '@/types/api';

interface EmrState {
  consultations: PaginatedData<Consultation> | null;
  currentConsultation: Consultation | null;
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  treatmentNotes: TreatmentNote[];
  medicalReports: PaginatedData<MedicalReport> | null;
  timeline: MedicalTimelineItem[];
  loading: boolean;
  error: string | null;
}

const initialState: EmrState = {
  consultations: null,
  currentConsultation: null,
  diagnoses: [],
  prescriptions: [],
  treatmentNotes: [],
  medicalReports: null,
  timeline: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchConsultations = createAsyncThunk(
  'emr/fetchConsultations',
  async ({ page = 0, size = 20, search }: { page?: number; size?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await emrApi.getConsultations(page, size, search);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchConsultationById = createAsyncThunk(
  'emr/fetchConsultationById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await emrApi.getConsultation(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchConsultationDetails = createAsyncThunk(
  'emr/fetchConsultationDetails',
  async (consultationId: number, { rejectWithValue }) => {
    try {
      const [diagRes, rxRes, notesRes] = await Promise.all([
        emrApi.getDiagnosesByConsultation(consultationId),
        emrApi.getPrescriptionsByConsultation(consultationId),
        emrApi.getNotesByConsultation(consultationId),
      ]);
      return {
        diagnoses: diagRes.data.data,
        prescriptions: rxRes.data.data,
        notes: notesRes.data.data,
      };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchTimeline = createAsyncThunk(
  'emr/fetchTimeline',
  async (patientId: number | 'me', { rejectWithValue }) => {
    try {
      const response = await (patientId === 'me' ? emrApi.getMyMedicalHistory() : emrApi.getMedicalHistory(patientId));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const emrSlice = createSlice({
  name: 'emr',
  initialState,
  reducers: {
    clearEmrError: (state) => {
      state.error = null;
    },
    clearCurrentConsultation: (state) => {
      state.currentConsultation = null;
      state.diagnoses = [];
      state.prescriptions = [];
      state.treatmentNotes = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Consultations
      .addCase(fetchConsultations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchConsultations.fulfilled, (state, action) => {
        state.loading = false;
        state.consultations = action.payload as PaginatedData<Consultation>;
      })
      .addCase(fetchConsultations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Consultation By Id
      .addCase(fetchConsultationById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchConsultationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConsultation = action.payload;
      })
      .addCase(fetchConsultationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Consultation Details
      .addCase(fetchConsultationDetails.fulfilled, (state, action) => {
        state.diagnoses = action.payload.diagnoses;
        state.prescriptions = action.payload.prescriptions;
        state.treatmentNotes = action.payload.notes;
      })
      // Fetch Timeline
      .addCase(fetchTimeline.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline = action.payload;
      })
      .addCase(fetchTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEmrError, clearCurrentConsultation } = emrSlice.actions;
export default emrSlice.reducer;
