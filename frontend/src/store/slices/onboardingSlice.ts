import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import onboardingApi from '@/api/onboarding';
import { RootState } from '../store';

interface OnboardingFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  address: {
    addressOne: string;
    addressTwo?: string;
    city: string;
    state: string;
    zipCode: string;
};
cellPhone: string;
workPhone?: string;
email: string;
ssn: string;
dateOfBirth: string;
gender: "male" | "female" | "prefer_not_to_say" | undefined;
}

interface OnboardingState {
  formData: OnboardingFormData;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

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
    address: {
        addressOne: '',
        addressTwo: '',
        city: '',
        state: '',
        zipCode: '',
      },
      cellPhone: '',
      workPhone: '',
      email: 'user@example.com', // Pre-filled example
      ssn: '',
      dateOfBirth: '',
      gender: undefined,
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