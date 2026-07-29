import api from './api';

export const documentService = {
  getAll: (lifeItemId) => api.get('/documents', { params: { lifeItemId } }).then((r) => r.data),
  upload: (file, lifeItemId, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lifeItemId', lifeItemId);
    return api
      .post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress) onProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      })
      .then((r) => r.data);
  },
  download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  remove: (id) => api.delete(`/documents/${id}`).then((r) => r.data),
};
