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
  
  saveOnboardingDraft: async (data: any) => {
    return api.post('/onboarding/draft', data);
  },
  
  getOnboardingData: async () => {
    return api.get('/onboarding');
  },
};

export default onboardingApi;