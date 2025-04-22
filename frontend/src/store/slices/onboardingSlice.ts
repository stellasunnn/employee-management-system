// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import onboardingApi from '../../api/onboarding'

// // 1. define form data and state interfaces
// // 2. define initial state
// // 3. create async thunks for form submission
// // 4. create async thunks for setting previous email
// // 5. create the redux slice
// // 6. define synchronous reducers (simple actions dont need async thunks) 
// // 7. define async reducers (async thunks)
// // 8. export actions and reducer


// export type OnboardingStatus = 'never_submitted' | 'pending' | 'approved' | 'rejected';
// export type Gender = 'male' | 'female' | 'not_specified';

// export interface Address {
//     buildingApt?: string;
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
// }

// export type ResidentStatus = 'Citizen' | 'Green Card' | 'non-resident';
// export type VisaStatus = 'H1-B' | 'L2' | 'F1(CPT/OPT)' | 'H4' | 'Other';

// export interface WorkAuthorization {
//     type: VisaStatus;
//     optReceipt?: string; 
//     otherVisaTitle?: string;
//     startDate: string;
//     endDate: string;
//     documents: Document[];
//   }

// export interface ReferencePerson {
//     firstName: string;
//     lastName: string;
//     middleName?: string;
//     phone?: string;
//     email?: string;
//     relationship: string;
// }

// export interface EmergencyContact {
//     firstName: string;
//     lastName: string;
//     middleName?: string;
//     phone?: string;
//     email?: string;
//     relationship: string;
// }

// export interface Document {
//     id: string;
//     name: string;
//     type: string;
//     url: string;
//     previewUrl: string;
//   }
  

// export interface OnboardingFormData {
//     firstName: string;
//     lastName: string;
//     middleName?: string;
//     prefferredName?: string;

//     profilePicture?: Document;

//     address: Address;
//     cellPhone: string;
//     workPhone?: string;
//     email: string; // prefilled 

//     ssn: string;
//     dateOfBirth: string;
//     gender: Gender;

//     residentStatus: ResidentStatus;
//     workAuthorization?: WorkAuthorization;
//     referencePerson?: ReferencePerson;
//     emergencyContact?: EmergencyContact[];

//     driversLicense?: Document;
//     allDocuments?: Document[];
    
//     status: OnboardingStatus;
//     feedback? : string; //only when rejected
// }

// export interface OnboardingState {
//     applicationData: OnboardingFormData | null;
//     loading: boolean;
//     submitting: boolean;
//     error: string | null;
//     success: boolean;
//     currentStep: number;
//     isEditable: boolean;
//     uploadProgress: {
//       [key: string]: number;
//     };
//     registrationEmail: string | null
//   }

// const initialState: OnboardingState = {
//     applicationData: null,
//     loading: false,
//     submitting: false,
//     error: null,
//     success: false,
//     currentStep: 1,
//     isEditable: true,
//     uploadProgress: {},
//     registrationEmail: null
// };

// // set email from token
// // export const setRegistrationEmail = createAsyncThunk(
// //     'onboarding/setEmail',
// //     async (email: string) => {
// //       return email;
// //     }
// //   );


// // Fetch onboarding application data
// export const fetchOnboardingData = createAsyncThunk(
//     'onboarding/fetchData'
// )


// export const submitOnboardingForm = createAsyncThunk(
//     'onboarding/submit',
//     async (formData: FormData, { rejectWithValue }) => {
//       try {
//         const response = await onboardingApi.submitOnboardingForm(formData);
//         return response.data;
//       } catch (error: any) {
//         return rejectWithValue(
//           error.response?.data?.message || 'Submission failed'
//         );
//       }
//     }
//   );

// // const onboardingSlice = createSlice({
// //     name: 'onboarding'
// // })

// export default onboardingSlice.reducer;