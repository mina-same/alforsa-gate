import api from './api';

export interface TourListItem {
  _id: string;
  heading: { en: string; ar?: string };
  slug: { en: string; ar?: string };
  images: { url: string; alt?: string }[];
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  duration?: { en: string; ar?: string };
  priceStartingFrom?: { EGP?: number; USD?: number; SAR?: number };
  createdAt: string;
}

export interface TourStats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const tourService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  }): Promise<{ tours: TourListItem[]; pagination: PaginationMeta }> {
    const { data } = await api.get('/tours', { params });
    return data.data;
  },

  async getById(id: string): Promise<any> {
    const { data } = await api.get(`/tours/${id}`);
    return data.data.tour;
  },

  async create(payload: any): Promise<any> {
    const { data } = await api.post('/tours', payload);
    return data.data.tour;
  },

  async update(id: string, payload: any): Promise<any> {
    const { data } = await api.put(`/tours/${id}`, payload);
    return data.data.tour;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tours/${id}`);
  },

  async toggleActive(id: string): Promise<{ isActive: boolean }> {
    const { data } = await api.patch(`/tours/${id}/toggle-active`);
    return data.data;
  },

  async toggleFeatured(id: string): Promise<{ isFeatured: boolean }> {
    const { data } = await api.patch(`/tours/${id}/toggle-featured`);
    return data.data;
  },

  async stats(): Promise<{ stats: TourStats; topViewed: any[] }> {
    const { data } = await api.get('/tours/stats');
    return data.data;
  },
};
