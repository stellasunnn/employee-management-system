import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import visaApi from '../../api/visa';

export type DocumentType = 'OPT_RECEIPT' | 'OPT_EAD' | 'I_983' | 'I_20';

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Document {
  type: DocumentType;
  fileUrl: string;
  status: DocumentStatus;
  feedback: string;
  uploadedAt: string;
  reviewedAt?: string;
}

interface VisaState {
  documents: Document[];
  currentStep: DocumentType | null;
  message: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: VisaState = {
  documents: [],
  currentStep: null,
  message: null,
  loading: false,
  error: null,
};

export const uploadDocument = createAsyncThunk(
  'visa/uploadDocument',
  async ({ type, file }: { type: DocumentType; file: File }, { rejectWithValue }) => {
    try {
      const response = await visaApi.uploadDocument(type, file);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  },
);

export const loadVisaDocuments = createAsyncThunk('visa/loadDocuments', async (_, { rejectWithValue }) => {
  try {
    const response = await visaApi.loadDocuments();
    return {
      documents: response.data.documents,
      currentStep: response.data.currentStep,
      message: response.data.message,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load documents');
  }
});

const visaSlice = createSlice({
  name: 'visa',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        const existingDocIndex = state.documents.findIndex((doc) => doc.type === action.payload.type);
        if (existingDocIndex >= 0) {
          state.documents[existingDocIndex] = action.payload;
        } else {
          state.documents.push(action.payload);
        }
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadVisaDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVisaDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.documents;
        state.currentStep = action.payload.currentStep;
        state.message = action.payload.message;
      })
      .addCase(loadVisaDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = visaSlice.actions;

export const selectVisaDocuments = (state: RootState) => state.visa.documents;
export const selectVisaLoading = (state: RootState) => state.visa.loading;
export const selectVisaError = (state: RootState) => state.visa.error;
export const selectVisaCurrentStep = (state: RootState) => state.visa.currentStep;
export const selectVisaMessage = (state: RootState) => state.visa.message;

export default visaSlice.reducer;
