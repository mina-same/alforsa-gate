import api from './api';

// ==================== SHARED TYPES ====================

export interface ILocalizedString {
  en: string;
  ar?: string;
}

export interface ILocalizedMixed {
  en: any;
  ar?: any;
}

export interface IImage {
  url: string;
  alt?: ILocalizedString;
  title?: ILocalizedString;
  width?: number;
  height?: number;
}

export interface ICurrencyPrice {
  EGP?: number;
  USD?: number;
  SAR?: number;
}

export interface IGroupSize {
  total?: number;
  remaining?: number;
}

export interface IExtra {
  label: ILocalizedString;
  price: ICurrencyPrice;
  perPerson: boolean;
}

export interface INote {
  title: ILocalizedString;
  text: ILocalizedMixed;
}

export interface IFAQ {
  question: ILocalizedString;
  answer: ILocalizedMixed;
}

export interface IDescription {
  header: ILocalizedString;
  text: ILocalizedMixed;
}

export interface IPrices {
  solo?: ICurrencyPrice;
  pax_2_4?: ICurrencyPrice;
  pax_5_8?: ICurrencyPrice;
  pax_9_16?: ICurrencyPrice;
}

export interface ISeason {
  seasonName: string;
  startDate?: string;
  endDate?: string;
  prices: IPrices;
  notes?: INote[];
}

export interface IPricingPlan {
  planName: string;
  seasons: ISeason[];
  notes?: INote[];
}

export interface IActivity {
  heading: ILocalizedString;
  description: ILocalizedMixed;
  image?: IImage;
}

export interface IItineraryDay {
  day: number;
  title: ILocalizedString;
  description: ILocalizedMixed;
  activities: IActivity[];
}

export interface IItinerary {
  generalDescription?: ILocalizedMixed;
  days: IItineraryDay[];
}

export interface IReview {
  type: 'youtube' | 'text' | 'video';
  url?: string;
  title: ILocalizedString;
  content?: ILocalizedMixed;
}

export interface ITourDocument {
  url: string;
  label: ILocalizedString;
}

export interface IRelatedTour {
  id: string;
  title: ILocalizedString;
  slug?: ILocalizedString;
  images?: IImage[];
  priceStartingFrom?: ICurrencyPrice;
  duration?: ILocalizedString;
  tourLocation?: ILocalizedString;
  averageRating?: number;
  reviewsCount?: number;
}

// ==================== FULL TOUR TYPE ====================

export interface ITourFull {
  _id: string;
  idExternal?: string;
  heading: ILocalizedString;
  headingDescription?: ILocalizedMixed;
  slug: ILocalizedString;
  Description: IDescription;
  images: IImage[];
  gallery?: IImage[];
  tourLocation?: ILocalizedString;
  tourAvailability?: ILocalizedString;
  pickupAndDropOff?: ILocalizedString;
  tourType?: ILocalizedString;
  tourStyle?: ILocalizedString;
  tourHighlights?: ILocalizedMixed[];
  inclusion?: ILocalizedMixed[];
  exclusion?: ILocalizedMixed[];
  pricingPlans: IPricingPlan[];
  priceStartingFrom?: ICurrencyPrice;
  duration?: ILocalizedString;
  meetingPoint?: ILocalizedString;
  cancellationPolicy?: ILocalizedString;
  tags?: ILocalizedMixed[];
  notes?: INote[];
  whatToPack?: ILocalizedMixed[];
  tourMapIframe?: string;
  scheduleImage?: IImage;
  whatYouWillLoveHtml?: ILocalizedMixed;
  itinerary?: IItinerary;
  faqs?: IFAQ[];
  relatedTours?: IRelatedTour[];
  reviews?: IReview[];
  reviewsCount?: number;
  averageRating?: number;
  extras?: IExtra[];
  groupSize?: IGroupSize;
  tourDocuments?: ITourDocument[];
  tourVideos?: string[];
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== LIST TYPES (admin) ====================

export interface TourListItem {
  _id: string;
  heading: ILocalizedString;
  slug: ILocalizedString;
  images: IImage[];
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  duration?: ILocalizedString;
  priceStartingFrom?: ICurrencyPrice;
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

// ==================== SERVICE ====================

export const tourService = {
  // Public — fetch by English slug
  async getBySlug(slug: string): Promise<ITourFull> {
    const { data } = await api.get(`/tours/slug/${slug}`);
    return data.data;
  },

  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  }): Promise<{ tours: TourListItem[]; pagination: PaginationMeta }> {
    const { data } = await api.get('/tours', { params });
    return { tours: data.tours, pagination: data.pagination };
  },

  // Public — active tours only, no auth required
  async listPublic(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isFeatured?: boolean;
  }): Promise<{ tours: TourListItem[]; pagination: PaginationMeta }> {
    const { data } = await api.get('/tours/public', { params });
    return { tours: data.tours, pagination: data.pagination };
  },

  async getById(id: string): Promise<ITourFull> {
    const { data } = await api.get(`/tours/${id}`);
    return data.data;
  },

  async create(payload: any): Promise<ITourFull> {
    const { data } = await api.post('/tours', payload);
    return data.data;
  },

  async update(id: string, payload: any): Promise<ITourFull> {
    const { data } = await api.put(`/tours/${id}`, payload);
    return data.data;
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
    // Server returns: { success, data: { total, active, inactive, featured, topViewed } }
    return { stats: data.data, topViewed: data.data.topViewed };
  },
};
