// src/store/slices/hrSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hrApi from '@/api/hrApi';

// Types
interface Application {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  // Include other application fields
  status: 'pending' | 'approved' | 'rejected';
  rejectionFeedback?: string;
  submittedAt: string;
}

interface HRState {
  applications: Application[];
  loading: boolean;
  error: string | null;
  currentStatus: 'pending' | 'approved' | 'rejected';
}

// Initial state
const initialState: HRState = {
  applications: [],
  loading: false,
  error: null,
  currentStatus: 'pending'
};

// Async thunks
export const fetchApplications = createAsyncThunk(
  'hr/fetchApplications',
  async (status: string = 'pending', { rejectWithValue }) => {
    try {
      const response = await hrApi.getApplications(status);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch applications');
    }
  }
);

export const approveApplication = createAsyncThunk(
  'hr/approveApplication',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await hrApi.approveApplication(id);
      return response.data.application;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to approve application');
    }
  }
);

export const rejectApplication = createAsyncThunk(
  'hr/rejectApplication',
  async ({ id, feedback }: { id: string; feedback: string }, { rejectWithValue }) => {
    try {
      const response = await hrApi.rejectApplication(id, feedback);
      return response.data.application;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reject application');
    }
  }
);

// Slice
const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    setCurrentStatus: (state, action) => {
      state.currentStatus = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch applications
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Approve application
      .addCase(approveApplication.fulfilled, (state, action) => {
        const index = state.applications.findIndex(app => app._id === action.payload.id);
        if (index !== -1) {
          state.applications.splice(index, 1);
        }
      })
      
      // Reject application
      .addCase(rejectApplication.fulfilled, (state, action) => {
        const index = state.applications.findIndex(app => app._id === action.payload.id);
        if (index !== -1) {
          state.applications.splice(index, 1);
        }
      });
  }
});

export const { setCurrentStatus } = hrSlice.actions;
export default hrSlice.reducer;