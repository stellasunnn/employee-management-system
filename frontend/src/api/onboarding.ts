import api from './base'; 

const onboardingApi = {
    submitOnboardingForm: async (formData: any) => {
        return api.post('/onboarding/submit', formData, {
            headers: {
            'Content-Type': 'application/json',
            }
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