import api from './api';

export const lifeItemService = {
  getAll: (params) => api.get('/life-items', { params }).then((r) => r.data),
  getById: (id) => api.get(`/life-items/${id}`).then((r) => r.data),
  create: (payload) => api.post('/life-items', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/life-items/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/life-items/${id}`).then((r) => r.data),
};
