import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@/types/auth';
import { authApi } from '@/api/authApi';
import { setToken, clearToken, getToken } from '@/utils/token';
import { extractErrorMessage } from '@/api/axios';
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: getToken(),
  status: 'idle',
  initialized: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (data: LoginRequest, { rejectWithValue }) => {
  try {
    const response = await authApi.login(data);
    const loginData = response.data.data;
    setToken(loginData.accessToken);
    return loginData;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const register = createAsyncThunk('auth/register', async (data: RegisterRequest, { rejectWithValue }) => {
  try {
    const response = await authApi.register(data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.me();
    return response.data.data;
  } catch (error) {
    clearToken();
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (data: ForgotPasswordRequest, { rejectWithValue }) => {
  try {
    await authApi.forgotPassword(data);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (data: ResetPasswordRequest, { rejectWithValue }) => {
  try {
    await authApi.resetPassword(data);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      clearToken();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(register.fulfilled, (state) => { state.status = 'succeeded'; })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch Me
      .addCase(fetchMe.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
        state.token = null;
        state.initialized = true;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => { state.status = 'loading'; })
      .addCase(forgotPassword.fulfilled, (state) => { state.status = 'succeeded'; })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => { state.status = 'loading'; })
      .addCase(resetPassword.fulfilled, (state) => { state.status = 'succeeded'; })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
