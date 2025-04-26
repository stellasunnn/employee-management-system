import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, register as registerApi, loadUser as loadUserApi } from '../../api/auth';

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async ({
    token,
    username,
    email,
    password,
  }: {
    token: string;
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      const data = await registerApi({ token, username, email, password });
      localStorage.setItem('token', data.token);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }) => {
    try {
      const data = await loginApi({ username, password });
      localStorage.setItem('token', data.token);
      // Load user data after successful login
      const userData = await loadUserApi(data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return { token: data.token, user: userData };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
);

export const loadUser = createAsyncThunk('auth/loadUser', async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const data = await loadUserApi(token);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to load user');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load user';
        state.token = null;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
