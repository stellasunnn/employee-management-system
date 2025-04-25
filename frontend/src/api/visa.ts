import api from './base';

const visaApi = {
  uploadDocument: async (type: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return api.post('/visa/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  loadDocuments: async () => {
    return api.get('/visa');
  },
};

export default visaApi;
