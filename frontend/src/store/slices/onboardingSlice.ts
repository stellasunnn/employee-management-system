import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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

// Page 2
citizenshipStatus?: {
    isPermanentResident: boolean;
    type: "green_card" | "citizen" | "work_authorization";
    workAuthorizationType?: "H1-B" | "H4" | "L2" | "F1" | "other";
    workAuthorizationOther?: string;
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
    type: "driver_license" | "passport" | "birth_certificate" | "other";
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
    
      citizenshipStatus: {
        isPermanentResident: false,
        type: "work_authorization", // Default to work authorization
        workAuthorizationType: undefined,
        workAuthorizationOther: '',
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
      emergencyContacts: [{
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        relationship: '',
      }],
      documents: [],
  },
  status: 'idle',
  error: null,
  currentStep: 1
};

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

    // updateField: (state, action) => {
    //   const { field, value } = action.payload;
    //   state.formData[field as keyof OnboardingFormData] = value;
    // },
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

export const { resetForm, updateFormData, setCurrentStep } = onboardingSlice.actions;

export const selectOnboardingData = (state: RootState) => state.onboarding.formData;
export const selectOnboardingStatus = (state: RootState) => state.onboarding.status;
export const selectOnboardingError = (state: RootState) => state.onboarding.error;
export const selectCurrentStep = (state: RootState) => state.onboarding.currentStep;

export default onboardingSlice.reducer;