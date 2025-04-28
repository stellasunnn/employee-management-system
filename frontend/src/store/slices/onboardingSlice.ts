import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import onboardingApi from '@/api/onboarding';
import { RootState } from '../store';
import { error } from 'console';
import { set } from 'react-hook-form';

interface OnboardingFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  profilePicture?: string;
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
  gender: 'male' | 'female' | 'prefer_not_to_say' | undefined;

  // Page 2
  citizenshipStatus?: {
    isPermanentResident: boolean;
    type: 'green_card' | 'citizen' | 'work_authorization';
    workAuthorizationType?: 'H1-B' | 'H4' | 'L2' | 'F1' | 'other';
    workAuthorizationOther?: string;
    startDate?: string;
    expirationDate?: string;
  };
  reference?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    phone: string;
    email: string;
    relationship: string;
  };
  emergencyContacts?: Array<{
    firstName: string;
    middleName?: string;
    lastName: string;
    phone: string;
    email: string;
    relationship: string;
  }>;
  documents?: Array<{
    type: 'driver_license' | "work_authorization" | "opt_receipt" | 'other';
    fileName: string;
    fileUrl?: string;
    uploadDate?: Date;
  }>;
}

interface OnboardingState {
  formData: OnboardingFormData;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentStep: number;
  applicationStatus: 'NEVER_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
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
    gender: undefined,

    citizenshipStatus: {
      isPermanentResident: false,
      type: 'work_authorization',
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
  applicationStatus: 'NEVER_SUBMITTED',
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

    setApplicationStatus: (state, action: PayloadAction<'NEVER_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED'>) => {
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
      .addCase(submitOnboardingForm.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitOnboardingForm.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if(action.payload.applicationStatus) {
            state.applicationStatus = action.payload.applicationStatus;
            if(action.payload.applicationStatus === 'REJECTED' && action.payload.feedback) {
                state.feedback = action.payload.feedback;
            }
        }else{
            state.applicationStatus = 'PENDING';
        }
      })
      .addCase(submitOnboardingForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to submit form';
      });
  },
});

export const { resetForm, updateFormData, setCurrentStep, setApplicationStatus, setFeedback} = onboardingSlice.actions;

export const selectOnboardingData = (state: RootState) => state.onboarding.formData;
export const selectOnboardingStatus = (state: RootState) => state.onboarding.status;
export const selectOnboardingError = (state: RootState) => state.onboarding.error;
export const selectCurrentStep = (state: RootState) => state.onboarding.currentStep;
export const selectApplicationStatus = (state: RootState) => state.onboarding.applicationStatus;
export const selectFeedback = (state: RootState) => state.onboarding.feedback;

export default onboardingSlice.reducer;
 
