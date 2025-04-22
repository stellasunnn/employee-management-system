import api from './base'; 

const onboardingApi = {
  submitOnboardingForm: async (formData: FormData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    };
    
    return api.post('/onboarding', formData, config);
  },
  
  saveOnboardingDraft: async (data: any) => {
    return api.post('/onboarding/draft', data);
  },
  
  getOnboardingData: async () => {
    return api.get('/onboarding');
  },
};

export default onboardingApi;