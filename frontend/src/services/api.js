import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ev_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ev_token');
      localStorage.removeItem('ev_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:           d       => API.post('/auth/login', d),
  register:        d       => API.post('/auth/register', d),
  getMe:           ()      => API.get('/auth/me'),
  updateProfile:   d       => API.put('/auth/profile', d),
  changePassword:  d       => API.put('/auth/password', d),
  forgotPassword:  d       => API.post('/auth/forgot-password', d),
  resetPassword:   (token, d) => API.post(`/auth/reset-password/${token}`, d),
};

export const courseAPI = {
  getAll:         params  => API.get('/courses', { params }),
  search:         q       => API.get('/courses/search', { params: { q } }),
  getOne:         id      => API.get(`/courses/${id}`),
  create:         d       => API.post('/courses', d),
  update:         (id, d) => API.put(`/courses/${id}`, d),
  delete:         id      => API.delete(`/courses/${id}`),
  getMyCourses:   ()      => API.get('/courses/my'),
  addWeek:        (id, d)             => API.post(`/courses/${id}/weeks`, d),
  addActivity:    (id, weekId, d)     => API.post(`/courses/${id}/weeks/${weekId}/activities`, d),
  deleteActivity: (id, weekId, actId) => API.delete(`/courses/${id}/weeks/${weekId}/activities/${actId}`),
};

export const enrollAPI = {
  enroll:         courseId      => API.post(`/enrollments/${courseId}`),
  getMyEnroll:    ()            => API.get('/enrollments/my'),
  updateProgress: (courseId, d) => API.put(`/enrollments/${courseId}/progress`, d),
};

export const assignAPI = {
  getByCourse:    courseId       => API.get(`/courses/${courseId}/assignments`),
  create:         (courseId, d)  => API.post(`/courses/${courseId}/assignments`, d),
  submit:         (id, d)        => API.post(`/assignments/${id}/submit`, d),
  getSubmissions: id             => API.get(`/assignments/${id}/submissions`),
  grade:          (id, subId, d) => API.put(`/assignments/${id}/submissions/${subId}/grade`, d),
};

export const quizAPI = {
  getByCourse: courseId  => API.get(`/courses/${courseId}/quizzes`),
  create:      (cId, d)  => API.post(`/courses/${cId}/quizzes`, d),
  submit:      (qId, d)  => API.post(`/quizzes/${qId}/submit`, d),
  getAttempts: qId       => API.get(`/quizzes/${qId}/attempts`),
};

export const analyticsAPI = {
  student:    () => API.get('/analytics/student'),
  instructor: () => API.get('/analytics/instructor'),
  admin:      () => API.get('/analytics/admin'),
};

export const adminAPI = {
  getUsers:           params => API.get('/admin/users', { params }),
  updateUser:         (id, d) => API.put(`/admin/users/${id}`, d),
  deleteUser:         id => API.delete(`/admin/users/${id}`),
  createInstructor:   d => API.post('/admin/users/create-instructor', d),
  getInstructors:     () => API.get('/admin/instructors'),
  getCourses:         () => API.get('/admin/courses'),
  updateCourseStatus: (id, d) => API.put(`/admin/courses/${id}/status`, d),
  createCourse:       d => API.post('/admin/courses', d),
  assignInstructor:   (id, d) => API.put(`/admin/courses/${id}/assign-instructor`, d),
};

export const notifAPI = {
  getAll:   () => API.get('/notifications'),
  markRead: id => API.put(`/notifications/${id}/read`),
  markAll:  () => API.put('/notifications/read-all'),
  delete:   id => API.delete(`/notifications/${id}`),
};

export const announcementAPI = {
  getByCourse: courseId => API.get(`/courses/${courseId}/announcements`),
  create:      (courseId, d) => API.post(`/courses/${courseId}/announcements`, d),
  remove:      id => API.delete(`/announcements/${id}`),
};

export const timelineAPI = {
  get: () => API.get('/timeline'),
};

export default API;
