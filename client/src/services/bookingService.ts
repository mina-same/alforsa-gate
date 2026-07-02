import api from './api';

export interface IBookingPayload {
  tourId: string;
  tourName: { en: string; ar?: string };
  tourSlug: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  travelDate: string;
  travelTime: '12:00' | '19:00';
  adults: number;
  youth: number;
  children: number;
  extras: Array<{ label: string; price: number }>;
  totalAmount: number;
  notes?: string;
}

export interface IBookingRecord {
  _id: string;
  bookingRef: string;
  tourId: string;
  tourName: { en: string; ar?: string };
  tourSlug: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  travelDate: string;
  travelTime: string;
  adults: number;
  youth: number;
  children: number;
  extras: Array<{ label: string; price: number }>;
  totalAmount: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface IBookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

export interface IBookingListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  tourId?: string;
}

export interface IBookingListResult {
  bookings: IBookingRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasMore: boolean;
  };
}

const bookingService = {
  submitBooking: async (payload: IBookingPayload): Promise<IBookingRecord> => {
    const res = await api.post('/bookings', payload);
    return res.data.data;
  },

  listBookings: async (params: IBookingListParams = {}): Promise<IBookingListResult> => {
    const res = await api.get('/bookings', { params });
    return { bookings: res.data.bookings, pagination: res.data.pagination };
  },

  getBookingStats: async (): Promise<IBookingStats> => {
    const res = await api.get('/bookings/stats');
    return res.data.data;
  },

  getBookingById: async (id: string): Promise<IBookingRecord> => {
    const res = await api.get(`/bookings/${id}`);
    return res.data.data;
  },

  updateBookingStatus: async (
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled',
  ): Promise<IBookingRecord> => {
    const res = await api.patch(`/bookings/${id}/status`, { status });
    return res.data.data;
  },

  deleteBooking: async (id: string): Promise<void> => {
    await api.delete(`/bookings/${id}`);
  },
};

export default bookingService;
