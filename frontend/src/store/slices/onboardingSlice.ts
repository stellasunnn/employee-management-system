// onboardingSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import onboardingApi from '@/api/onboarding';
import { RootState } from '../store';

// Define your interfaces
interface OnboardingFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  
  // Add other fields as needed
}

interface OnboardingState {
  formData: OnboardingFormData;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Simplified createAsyncThunk without complex generics
export const submitOnboardingForm = createAsyncThunk(
  'onboarding/submit',
  async (formData: OnboardingFormData, { rejectWithValue }) => {
    try {
      const response = await onboardingApi.submitOnboardingForm(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Submission failed'
      );
    }
  }
);

// Initial state
const initialState: OnboardingState = {
  formData: {
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
  },
  status: 'idle',
  error: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field as keyof OnboardingFormData] = value;
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOnboardingForm.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitOnboardingForm.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(submitOnboardingForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to submit form';
      });
  },
});

export const { updateField, resetForm } = onboardingSlice.actions;

export const selectOnboardingData = (state: RootState) => state.onboarding.formData;
export const selectOnboardingStatus = (state: RootState) => state.onboarding.status;
export const selectOnboardingError = (state: RootState) => state.onboarding.error;

export default onboardingSlice.reducer;