import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000', // Use your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchEligibleLecturers = async (courseId) => {
  const response = await apiClient.post('/api/lecturers/available', { courseId });
  return response.data;
};

export const updateCourse = async (courseId, lecturerId) => {
  const response = await apiClient.put(`/api/courses/update/${courseId}`, {
    assignedUser: lecturerId,
  });
  return response.data;
};


export default apiClient;
