import api from './api';

export const categoryService = {
  getAll: () => api.get('/categories').then((r) => r.data),
  create: (payload) => api.post('/categories', payload).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};
