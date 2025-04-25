import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import onboardingApi from '@/api/onboarding';
import { RootState } from '../store';
import { error } from 'console';

interface Document {
    id: string;
    fileNmae: string;
    url: string;
    
}

interface DocumentUploadState {
    documents: Document[];
    error: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialDocumentUploadState: DocumentUploadState = {
    documents: [],
    error: null,
    status: 'idle',
}

export const uploadDocument = createAsyncThunk(
    'onboarding/uploadDocument',
    async (formData: FormData, { rejectWithValue }) => {
      try {
        const response = await onboardingApi.uploadDocument(formData);
        return response.data;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Document upload failed');
      }
    },
  );

  const uploadDocumentSlice = createSlice({
    name: "uploadDocument",
    initialState: initialDocumentUploadState,
    reducers: {
        resetDocumentUpload: (state) => {
            state.documents = [];
            state.error = null;
            state.status = 'idle';
        }  
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadDocument.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(uploadDocument.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.documents.push(action.payload);
            })
            .addCase(uploadDocument.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
  })

export const { resetDocumentUpload } = uploadDocumentSlice.actions;


export default uploadDocumentSlice.reducer;
