import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Prediction, PredictionRequest, Explanation } from '@/types/prediction';
import type { PageMeta } from '@/types/api';
import { predictionApi } from '@/api/predictionApi';
import { extractErrorMessage } from '@/api/axios';

interface PredictionState {
  list: Prediction[];
  selected: Prediction | null;
  explanation: Explanation | null;
  meta: PageMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PredictionState = {
  list: [],
  selected: null,
  explanation: null,
  meta: null,
  status: 'idle',
  error: null,
};

export const createPrediction = createAsyncThunk(
  'predictions/create',
  async (data: PredictionRequest, { rejectWithValue }) => {
    try {
      const res = await predictionApi.create(data);
      return res.data.data;
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const fetchPredictions = createAsyncThunk(
  'predictions/fetchAll',
  async (params: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const res = await predictionApi.list(params);
      return { data: res.data.data, meta: res.data.meta ?? null };
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const fetchPrediction = createAsyncThunk(
  'predictions/fetchOne',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await predictionApi.get(id);
      return res.data.data;
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const fetchExplanation = createAsyncThunk(
  'predictions/fetchExplanation',
  async (predictionId: number, { rejectWithValue }) => {
    try {
      const res = await predictionApi.getExplanation(predictionId);
      return res.data.data;
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const deletePrediction = createAsyncThunk(
  'predictions/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await predictionApi.remove(id);
      return id;
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

const predictionSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    clearSelected(state) { state.selected = null; state.explanation = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPrediction.pending, (state) => { state.status = 'loading'; })
      .addCase(createPrediction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(createPrediction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchPredictions.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPredictions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchPredictions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchPrediction.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(fetchExplanation.fulfilled, (state, action) => {
        state.explanation = action.payload;
      })
      .addCase(deletePrediction.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload);
      });
  },
});

export const { clearSelected } = predictionSlice.actions;
export default predictionSlice.reducer;
