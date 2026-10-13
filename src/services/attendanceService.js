import api from './api';

export const attendanceService = {
  markBulkAttendance: async (bulkData) => {
    const response = await api.post('/attendance/bulk', bulkData);
    return response.data;
  },

  getAttendanceByCourse: async (courseId, date = null) => {
    const params = date ? { date } : {};
    const response = await api.get(`/attendance/course/${courseId}`, { params });
    return response.data;
  },

  getAttendanceByStudent: async (studentId) => {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data;
  },

  getAttendanceByStudentAndCourse: async (studentId, courseId) => {
    const response = await api.get(`/attendance/student/${studentId}/course/${courseId}`);
    return response.data;
  }
};
