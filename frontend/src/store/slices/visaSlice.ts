import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import visaApi from '../../api/visa';

export type DocumentStatus = 'pending' | 'approved' | 'rejected';
export type DocumentType = 'opt_receipt' | 'opt_ead' | 'i983' | 'i20';

interface Document {
  type: DocumentType;
  status: DocumentStatus;
  feedback?: string;
  fileUrl?: string;
  uploadedAt?: string;
}

interface VisaState {
  documents: Document[];
  loading: boolean;
  error: string | null;
}

const initialState: VisaState = {
  documents: [],
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
    return response.data.documents;
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
        state.documents = action.payload;
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

export default visaSlice.reducer;
