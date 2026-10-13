import api from './api';

export const gradeService = {
  saveGrade: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },

  getGradesByStudent: async (studentId) => {
    const response = await api.get(`/grades/student/${studentId}`);
    return response.data;
  },

  getGradesByCourse: async (courseId) => {
    const response = await api.get(`/grades/course/${courseId}`);
    return response.data;
  },

  getStudentReport: async (studentId) => {
    const response = await api.get(`/grades/report/${studentId}`);
    return response.data;
  },

  deleteGrade: async (id) => {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  },

  exportCsv: async () => {
    const response = await api.get('/grades/export/csv', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `grades_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
