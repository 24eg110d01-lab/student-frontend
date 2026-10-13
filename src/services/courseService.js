import api from './api';

export const courseService = {
  getCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  getCoursesByTeacher: async (teacherId) => {
    const response = await api.get(`/courses/teacher/${teacherId}`);
    return response.data;
  },

  createCourse: async (data) => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  updateCourse: async (id, data) => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  enrollStudents: async (courseId, studentIds) => {
    const response = await api.post(`/courses/${courseId}/enroll`, { studentIds });
    return response.data;
  },

  dropStudent: async (courseId, studentId) => {
    const response = await api.post(`/courses/${courseId}/drop/${studentId}`);
    return response.data;
  },

  getEnrolledStudents: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/students`);
    return response.data;
  }
};
