import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hrApi from '@/api/hrApi';
import { RootState } from '../store';

interface Application {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionFeedback: string;
  submittedAt: string;
}

interface HRState {
  applications: Application[];
  loading: boolean;
  error: string | null;
  currentStatus: 'pending' | 'approved' | 'rejected';
}

const initialState: HRState = {
  applications: [],
  loading: false,
  error: null,
  currentStatus: 'pending',
};

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

export const fetchApplicationById = createAsyncThunk(
    'hr/fetchApplicationById',
    async (id: string, { rejectWithValue }) => {
      try {
        const response = await hrApi.getApplicationById(id); // Fetch a single application by ID
        console.log('Fetched application:', response.data)
        return response.data;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.error || 'Failed to fetch application');
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

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    setCurrentStatus: (state, action) => {
      state.currentStatus = action.payload;
    },
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
      })

        // Fetch application by ID
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        const application = action.payload;
        const index = state.applications.findIndex(app => app._id === application._id);
        if (index !== -1) {
          state.applications[index] = application; // Update the application in the state
        } else {
          state.applications.push(application); // Add the application if it doesn't exist
        }
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });;
  }
});

export const { setCurrentStatus} = hrSlice.actions;
export default hrSlice.reducer;
export const selectApplications = (state: RootState) => state.hr.applications
export const selectApplicationById = (state: RootState, id: string) =>
    state.hr.applications.find(app => app._id === id);