import api from './base';

const hrApi = {
  // Get all applications (optional status filter)
  getApplications: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return api.get(`/hr/${query}`);
  },
  
  // Get a specific application by ID
  getApplicationById: (id: string) => {
    return api.get(`/hr/${id}`);
  },
  
  // Approve an application
  approveApplication: (id: string) => {
    return api.post(`/hr/${id}/approve`);
  },
  
  // Reject an application with feedback
  rejectApplication: (id: string, feedback: string) => {
    return api.post(`/hr/${id}/reject`, { feedback });
  }
  
};

export default hrApi;