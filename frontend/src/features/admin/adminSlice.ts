import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@/types/auth';
import type { Analytics, AuditLog } from '@/types/admin';
import type { PageMeta } from '@/types/api';
import { adminApi } from '@/api/adminApi';
import { extractErrorMessage } from '@/api/axios';

interface AdminState {
  analytics: Analytics | null;
  pendingDoctors: User[];
  users: User[];
  usersMeta: PageMeta | null;
  auditLogs: AuditLog[];
  auditMeta: PageMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminState = {
  analytics: null,
  pendingDoctors: [],
  users: [],
  usersMeta: null,
  auditLogs: [],
  auditMeta: null,
  status: 'idle',
  error: null,
};

export const fetchAnalytics = createAsyncThunk('admin/analytics', async (_, { rejectWithValue }) => {
  try { const res = await adminApi.getAnalytics(); return res.data.data; }
  catch (error) { return rejectWithValue(extractErrorMessage(error)); }
});

export const fetchPendingDoctors = createAsyncThunk('admin/pendingDoctors', async (_, { rejectWithValue }) => {
  try { const res = await adminApi.getPendingDoctors(); return res.data.data; }
  catch (error) { return rejectWithValue(extractErrorMessage(error)); }
});

export const approveDoctor = createAsyncThunk('admin/approve', async (id: number, { rejectWithValue }) => {
  try { await adminApi.approveDoctor(id); return id; }
  catch (error) { return rejectWithValue(extractErrorMessage(error)); }
});

export const rejectDoctor = createAsyncThunk('admin/reject', async (id: number, { rejectWithValue }) => {
  try { await adminApi.rejectDoctor(id); return id; }
  catch (error) { return rejectWithValue(extractErrorMessage(error)); }
});

export const fetchUsers = createAsyncThunk('admin/users',
  async (params: { role?: string; page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const res = await adminApi.getUsers(params);
      return { data: res.data.data, meta: res.data.meta ?? null };
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id: number, { rejectWithValue }) => {
  try { await adminApi.deleteUser(id); return id; }
  catch (error) { return rejectWithValue(extractErrorMessage(error)); }
});

export const fetchAuditLogs = createAsyncThunk('admin/auditLogs',
  async (params: { userId?: number; page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const res = await adminApi.getAuditLogs(params);
      return { data: res.data.data, meta: res.data.meta ?? null };
    } catch (error) { return rejectWithValue(extractErrorMessage(error)); }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.fulfilled, (state, action) => { state.analytics = action.payload; })
      .addCase(fetchPendingDoctors.fulfilled, (state, action) => { state.pendingDoctors = action.payload; })
      .addCase(approveDoctor.fulfilled, (state, action) => {
        state.pendingDoctors = state.pendingDoctors.filter(d => d.id !== action.payload);
      })
      .addCase(rejectDoctor.fulfilled, (state, action) => {
        state.pendingDoctors = state.pendingDoctors.filter(d => d.id !== action.payload);
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.data;
        state.usersMeta = action.payload.meta;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload.data;
        state.auditMeta = action.payload.meta;
      });
  },
});

export default adminSlice.reducer;
