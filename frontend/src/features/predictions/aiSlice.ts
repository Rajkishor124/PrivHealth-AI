import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RiskAssessmentResponse, RiskAlertResponse, GeneratePredictionRequest } from '@/types/ai';
import { PageMeta } from '@/types/api';
import { aiApi } from '@/api/aiApi';
import { extractErrorMessage } from '@/api/axios';

interface AiState {
  assessments: RiskAssessmentResponse[];
  alerts: RiskAlertResponse[];
  meta: PageMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AiState = {
  assessments: [],
  alerts: [],
  meta: null,
  status: 'idle',
  error: null,
};

export const generatePredictions = createAsyncThunk(
  'ai/generate',
  async (request: GeneratePredictionRequest, { rejectWithValue }) => {
    try {
      const res = await aiApi.generatePredictions(request);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchPatientPredictions = createAsyncThunk(
  'ai/fetchPatient',
  async (params: { patientId: number; page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const res = await aiApi.getPatientPredictions(params.patientId, params.page, params.size);
      return { data: res.data, meta: res.meta ?? null };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchRiskAlerts = createAsyncThunk(
  'ai/fetchAlerts',
  async (params: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const res = await aiApi.getRiskAlerts(params.page, params.size);
      return { data: res.data, meta: res.meta ?? null };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAiData(state) {
      state.assessments = [];
      state.alerts = [];
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generatePredictions.pending, (state) => { state.status = 'loading'; })
      .addCase(generatePredictions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.assessments = action.payload;
      })
      .addCase(generatePredictions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchPatientPredictions.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPatientPredictions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.assessments = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchPatientPredictions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchRiskAlerts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchRiskAlerts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.alerts = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchRiskAlerts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearAiData } = aiSlice.actions;
export default aiSlice.reducer;
