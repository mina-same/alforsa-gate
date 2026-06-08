import api from './api';

export interface AdminUserRecord {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  users: AdminUserRecord[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export const userService = {
  async list(filters: UserFilters = {}): Promise<UserListResponse> {
    const params = new URLSearchParams();
    if (filters.page)     params.set('page',     String(filters.page));
    if (filters.limit)    params.set('limit',    String(filters.limit));
    if (filters.search)   params.set('search',   filters.search);
    if (filters.role)     params.set('role',     filters.role);
    if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
    const { data } = await api.get(`/users?${params}`);
    return data.data; // { users, pagination }
  },

  async get(id: string): Promise<AdminUserRecord> {
    const { data } = await api.get(`/users/${id}`);
    return data.data.user;
  },

  async create(payload: { name: string; email: string; password: string; role: string }): Promise<AdminUserRecord> {
    const { data } = await api.post('/users', payload);
    return data.data.user;
  },

  async update(id: string, payload: { name?: string; email?: string; password?: string; role?: string }): Promise<AdminUserRecord> {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.data.user;
  },

  async toggleActive(id: string): Promise<AdminUserRecord> {
    const { data } = await api.patch(`/users/${id}/toggle-active`);
    return data.data.user;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
