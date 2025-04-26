import api from './base';

const hiringApi = {
  generateToken: async (email: string, name: string) => {
    return api.post('/hr/generate-token', { email, name });
  },

  getTokenHistory: async () => {
    return api.get('/hr/token-history');
  },
};

export default hiringApi;
