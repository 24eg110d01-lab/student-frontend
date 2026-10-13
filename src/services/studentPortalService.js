import api from './api';

export const studentPortalService = {
  getProfile: async () => {
    const response = await api.get('/student-portal/profile');
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/student-portal/summary');
    return response.data;
  },

  getCourses: async () => {
    const response = await api.get('/student-portal/courses');
    return response.data;
  },

  getAttendance: async () => {
    const response = await api.get('/student-portal/attendance');
    return response.data;
  }
};
