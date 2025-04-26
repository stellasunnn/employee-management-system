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
  _id: string;
  type: DocumentType;
  fileUrl: string;
  status: DocumentStatus;
  feedback: string;
  uploadedAt: string;
  reviewedAt?: string;
}

export interface EmployeeVisaData {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  documents: Document[];
  currentStep: DocumentType | null;
  workAuthorization: {
    title: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
  nextStep: string;
  requiresHRApproval: boolean;
  pendingDocument?: Document;
}

interface VisaState {
  documents: Document[];
  currentStep: DocumentType | null;
  message: string | null;
  loading: boolean;
  error: string | null;
  employees: EmployeeVisaData[];
  searchTerm: string;
  selectedStatus: DocumentStatus | 'ALL';
  activeTab: 'in-progress' | 'all';
  searchResults: EmployeeVisaData[];
}

const initialState: VisaState = {
  documents: [],
  currentStep: null,
  message: null,
  loading: false,
  error: null,
  employees: [],
  searchTerm: '',
  selectedStatus: 'ALL',
  activeTab: 'in-progress',
  searchResults: [],
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

export const sendReminder = createAsyncThunk('visa/sendReminder', async (userId: string, { rejectWithValue }) => {
  try {
    const response = await visaApi.sendReminder(userId);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to send reminder');
  }
});

export const approveDocument = createAsyncThunk('visa/approveDocument', async (visaId: string, { rejectWithValue }) => {
  try {
    const response = await visaApi.approveDocument(visaId);
    console.log('response', response);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to approve document');
  }
});

export const rejectDocument = createAsyncThunk(
  'visa/rejectDocument',
  async ({ visaId, feedback }: { visaId: string; feedback: string }, { rejectWithValue }) => {
    try {
      const response = await visaApi.rejectDocument(visaId, feedback);
      console.log('response', response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject document');
    }
  },
);

export const loadEmployeeVisaData = createAsyncThunk(
  'visa/loadEmployeeVisaData',
  async (activeTab: 'in-progress' | 'all', { rejectWithValue }) => {
    try {
      let response;
      if (activeTab === 'in-progress') {
        response = await visaApi.getInprogressVisaApplications();
      } else {
        response = await visaApi.getAllEmployeeVisaData();
      }

      const processedData = response.data.map((employee: any) => {
        const lastDocument = employee.documents[employee.documents.length - 1];
        const requiresHRApproval = lastDocument?.status === DocumentStatus.PENDING;
        const pendingDocument = requiresHRApproval ? lastDocument : undefined;

        let nextStep = '';
        if (!employee.documents.length) {
          nextStep = 'Submit OPT Receipt';
        } else if (lastDocument?.status === DocumentStatus.REJECTED) {
          nextStep = `Resubmit ${lastDocument.type.replace('_', ' ')}`;
        } else if (lastDocument?.status === DocumentStatus.PENDING) {
          nextStep = `Waiting for HR approval of ${lastDocument.type.replace('_', ' ')}`;
        } else if (lastDocument?.status === DocumentStatus.APPROVED) {
          switch (lastDocument.type) {
            case 'OPT_RECEIPT':
              nextStep = 'Submit OPT EAD';
              break;
            case 'OPT_EAD':
              nextStep = 'Submit I-983';
              break;
            case 'I_983':
              nextStep = 'Submit I-20';
              break;
            case 'I_20':
              nextStep = 'All documents approved';
              break;
          }
        }

        return {
          _id: employee._id,
          ...employee,
          workAuthorization: {
            title: employee.workAuthorization?.title || 'Not specified',
            startDate: employee.workAuthorization?.startDate || new Date().toISOString(),
            endDate: employee.workAuthorization?.endDate || new Date().toISOString(),
            daysRemaining: employee.workAuthorization?.daysRemaining || 0,
          },
          nextStep,
          requiresHRApproval,
          pendingDocument,
        };
      });

      return processedData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load employee visa data');
    }
  },
);

const visaSlice = createSlice({
  name: 'visa',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
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
      })
      .addCase(sendReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendReminder.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(sendReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(approveDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(approveDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(rejectDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(rejectDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadEmployeeVisaData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadEmployeeVisaData.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(loadEmployeeVisaData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSearchTerm, setSelectedStatus, setActiveTab, setSearchResults } = visaSlice.actions;

export const selectVisaDocuments = (state: RootState) => state.visa.documents;
export const selectVisaLoading = (state: RootState) => state.visa.loading;
export const selectVisaError = (state: RootState) => state.visa.error;
export const selectVisaCurrentStep = (state: RootState) => state.visa.currentStep;
export const selectVisaMessage = (state: RootState) => state.visa.message;
export const selectEmployees = (state: RootState) => state.visa.employees;
export const selectSearchTerm = (state: RootState) => state.visa.searchTerm;
export const selectSelectedStatus = (state: RootState) => state.visa.selectedStatus;
export const selectActiveTab = (state: RootState) => state.visa.activeTab;
export const selectSearchResults = (state: RootState) => state.visa.searchResults;

export default visaSlice.reducer;
