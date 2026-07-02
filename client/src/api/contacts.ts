import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const authAxios = () => {
  const token = localStorage.getItem('accessToken');
  return axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export interface ContactPayload {
  name: string;
  email: string;
  website?: string;
  message: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  website: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
  updatedAt: string;
}

export const submitContact = (data: ContactPayload) =>
  axios.post(`${API_URL}/contacts`, data);

export const getContacts = (params?: { page?: number; limit?: number; status?: string }) =>
  authAxios().get('/contacts', { params });

export const getUnreadCount = () =>
  authAxios().get<{ success: boolean; count: number }>('/contacts/unread-count');

export const updateContactStatus = (id: string, status: 'new' | 'read' | 'replied') =>
  authAxios().patch(`/contacts/${id}/status`, { status });

export const deleteContact = (id: string) =>
  authAxios().delete(`/contacts/${id}`);
