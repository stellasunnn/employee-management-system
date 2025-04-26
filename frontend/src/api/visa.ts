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

  getInprogressVisaApplications: async () => {
    return api.get('/visa/hr/in-progress');
  },

  // HR-specific endpoints
  getAllEmployeeVisaData: async () => {
    return api.get('/visa/hr/all');
  },

  approveDocument: async (userId: string, documentType: string) => {
    return api.post(`/visa/hr/approve/${userId}/${documentType}`);
  },

  rejectDocument: async (userId: string, documentType: string, feedback: string) => {
    return api.post(`/visa/hr/reject/${userId}/${documentType}`, { feedback });
  },
};

export default visaApi;
