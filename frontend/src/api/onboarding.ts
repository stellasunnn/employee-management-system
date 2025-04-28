import api from './base';

const onboardingApi = {
  submitOnboardingForm: async (formData: any) => {
    return api.post('/onboarding/application', formData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },
  uploadDocument: async (formData: FormData) => {
    return api.post('/onboarding/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  fetchApplicationStatus: async () => {
    return api.get('/onboarding/application/status');
  },
  saveOnboardingDraft: async (data: any) => {
    return api.post('/onboarding/draft', data);
  },
  getOnboardingData: async () => {
    return api.get('/onboarding');
  },

  getDocument: async (documentId: string) => {
    return api.get(`/onboarding/document/${documentId}`);
  },
  
  deleteDocument: async (documentId: string) => {
    return api.delete(`/onboarding/document/${documentId}`);
  },
  
  updateDocument: async (documentId: string, formData: FormData) => {
    return api.put(`/onboarding/document/${documentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  resubmitApplication: async (formData: any) => {
    return api.put('/onboarding/application', formData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },
  
  getDocumentPreviewUrl: async (documentId: string) => {
    return api.get(`/onboarding/document/${documentId}/preview`);
  }
};

export default onboardingApi;