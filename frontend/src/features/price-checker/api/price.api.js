/**
 * @fileoverview Price Checker API layer.
 */

import api from '../../../lib/axios';

const priceApi = {
  analyze: (payload) => api.post('/price/analyze', payload),
  scrapeURL: (url) => api.post('/price/scrape', { url }),
  getHistory: (params) => api.get('/price/history', { params }),
  getById: (id) => api.get(`/price/${id}`),
};

export default priceApi;
