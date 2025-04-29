import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import onboardingApi from '@/api/onboarding';
import { RootState } from '../store';
import { error } from 'console';
import { set } from 'react-hook-form';
import { fullFormSchema } from '@/components/onboarding/schema';
import { OnboardingFormData } from '@/components/onboarding/schema';

import { ApplicationStatus, CitizenshipType } from '@/components/onboarding/schema';

interface OnboardingState {
  formData: OnboardingFormData;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentStep: number;
  applicationStatus: ApplicationStatus;
  feedback: string;
}

// Initial state
const initialState: OnboardingState = {
  formData: {
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    profilePicture: '',
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
    gender: 'prefer_not_to_say',
    citizenshipStatus: {
      isPermanentResident: false,
      type: CitizenshipType.WorkAuthorization,
      workAuthorizationType: undefined,
      workAuthorizationOther: '',
      startDate: '',
      expirationDate: '',
    },
    reference: {
      firstName: '',
      middleName: '',
      lastName: '',
      phone: '',
      email: '',
      relationship: '',
    },
    emergencyContacts: [
      {
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        relationship: '',
      },
    ],
    documents: [],
  },
  status: 'idle',
  error: null,
  currentStep: 1,
  applicationStatus: ApplicationStatus.NeverSubmitted,
  feedback: '',
};

export const submitOnboardingForm = createAsyncThunk(
  'onboarding/submit',
  async (formData: OnboardingFormData, { rejectWithValue }) => {
    try {
      const response = await onboardingApi.submitOnboardingForm(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Submission failed');
    }
  },
);

export const fetchApplicationData = createAsyncThunk('onboarding/fetchData', async (_, { rejectWithValue }) => {
  try {
    const response = await onboardingApi.fetchApplicationData();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch data');
  }
});

export const resubmitApplication = createAsyncThunk('onboarding/resubmit', async (formData, { rejectWithValue }) => {
  try {
    const response = await onboardingApi.resubmitApplication(formData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to resubmit application');
  }
});

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    updateFormData: (state, action: PayloadAction<Partial<OnboardingFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },

    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },

    setApplicationStatus: (state, action: PayloadAction<ApplicationStatus>) => {
      state.applicationStatus = action.payload;
    },

    setFeedback: (state, action: PayloadAction<string>) => {
      state.feedback = action.payload;
    },

    resetForm: (state) => {
      state.formData = initialState.formData;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit form
      .addCase(submitOnboardingForm.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitOnboardingForm.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.applicationStatus) {
          state.applicationStatus = action.payload.applicationStatus;
          if (action.payload.applicationStatus === 'REJECTED' && action.payload.feedback) {
            state.feedback = action.payload.feedback;
          }
        } else {
          state.applicationStatus = ApplicationStatus.Pending;
        }
      })
      .addCase(submitOnboardingForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to submit form';
      })

      // Check application status
      .addCase(fetchApplicationData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchApplicationData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.applicationStatus = action.payload.status;
        state.formData = action.payload;
        state.feedback = action.payload.feedback || '';
      })
      .addCase(fetchApplicationData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch application status';
      })

      // Resubmit application
      .addCase(resubmitApplication.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(resubmitApplication.fulfilled, (state) => {
        state.status = 'succeeded';
        state.applicationStatus = ApplicationStatus.Pending;
        state.error = null;
      })
      .addCase(resubmitApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to resubmit application';
      });
  },
});

export const { resetForm, updateFormData, setCurrentStep, setApplicationStatus, setFeedback } = onboardingSlice.actions;

export const selectOnboardingData = (state: RootState) => state.onboarding.formData;
export const selectOnboardingStatus = (state: RootState) => state.onboarding.status;
export const selectOnboardingError = (state: RootState) => state.onboarding.error;
export const selectCurrentStep = (state: RootState) => state.onboarding.currentStep;
export const selectApplicationStatus = (state: RootState) => state.onboarding.applicationStatus;
export const selectFeedback = (state: RootState) => state.onboarding.feedback;
export const selectDocuments = (state: RootState) => state.onboarding.formData.documents;
export default onboardingSlice.reducer;
