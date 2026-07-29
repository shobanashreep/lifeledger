import api from './api';

export const userService = {
  updateProfile: (payload) => api.put('/users/profile', payload).then((r) => r.data),
  changePassword: (payload) => api.put('/users/password', payload).then((r) => r.data),
  updatePreferences: (payload) => api.put('/users/preferences', payload).then((r) => r.data),
  deleteAccount: (password) => api.delete('/users/account', { data: { password } }).then((r) => r.data),
};
