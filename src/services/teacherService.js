import api from './api';

export const teacherService = {
  getTeachers: async () => {
    const response = await api.get('/teachers');
    return response.data;
  },

  getTeacherById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  createTeacher: async (data) => {
    const response = await api.post('/teachers', data);
    return response.data;
  },

  updateTeacher: async (id, data) => {
    const response = await api.put(`/teachers/${id}`, data);
    return response.data;
  },

  deleteTeacher: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  }
};
