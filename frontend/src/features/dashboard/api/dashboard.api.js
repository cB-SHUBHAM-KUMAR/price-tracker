import api from '../../../lib/axios';

const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export default dashboardApi;
