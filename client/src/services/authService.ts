import api from './api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  lastLogin?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AdminUser> {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data.user;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  async getMe(): Promise<AdminUser> {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },
};
