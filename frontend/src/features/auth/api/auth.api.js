import api from '../../../lib/axios';

const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: (token) => api.post('/auth/refresh-token', { refreshToken: token }),
  logout: () => api.post('/auth/logout'),
};

export default authApi;
