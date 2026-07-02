import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ILocalizedString { en: string; ar?: string; }
export interface ILocalizedMixed  { en: any;    ar?: any;   }

export interface IDestinationStat {
  capital: ILocalizedString;
  language: ILocalizedString;
  currency: ILocalizedString;
  bestSeason: ILocalizedString;
}

export interface IStatCounter { value: string; label: ILocalizedString; }

export interface IAttraction {
  img: string;
  city: ILocalizedString;
  name: ILocalizedString;
  desc: ILocalizedString;
}

export interface ISeason {
  icon: string;
  name: ILocalizedString;
  desc: ILocalizedString;
  tag: ILocalizedString;
  highlight: boolean;
}

export interface IFood {
  emoji: string;
  name: ILocalizedString;
  desc: ILocalizedString;
}

export interface IBudgetTier {
  level: ILocalizedString;
  range: ILocalizedString;
  desc: ILocalizedString;
}

export interface IPracticalItem { en: string; ar?: string; }

export interface IPracticalSection {
  icon: string;
  title: ILocalizedString;
  items: IPracticalItem[];
}

export interface IFAQ {
  question: ILocalizedString;
  answer: ILocalizedString;
}

export interface IGalleryItem {
  url: string;
  caption?: ILocalizedString;
  alt?: ILocalizedString;
}

export interface IRelatedBlog {
  slug: string;
  title: ILocalizedString;
  excerpt: ILocalizedString;
  coverImage: string;
  publishedAt: string;
  readTime?: number;
}

export interface IDestination {
  _id: string;
  slug: string;
  isActive: boolean;
  countryFlag?: string;
  primaryColor?: string;

  heroImage: string;
  name: ILocalizedString;
  subtitle: ILocalizedString;
  heroCta?: ILocalizedString;
  heroExplore?: ILocalizedString;
  heroScroll?: ILocalizedString;
  heroTagline?: ILocalizedString;

  stats?: IDestinationStat;
  aboutImage?: string;
  aboutTitle?: ILocalizedString;
  aboutText?: ILocalizedString;
  statCounters?: IStatCounter[];

  attractions?: IAttraction[];
  attractionsTitle?: ILocalizedString;
  attractionsSubtitle?: ILocalizedString;

  seasons?: ISeason[];
  seasonTitle?: ILocalizedString;
  seasonSubtitle?: ILocalizedString;

  foods?: IFood[];
  foodTitle?: ILocalizedString;
  foodSubtitle?: ILocalizedString;

  budgets?: IBudgetTier[];
  budgetTitle?: ILocalizedString;

  practicalSections?: IPracticalSection[];
  practicalTitle?: ILocalizedString;
  practicalSubtitle?: ILocalizedString;

  faqs?: IFAQ[];
  faqTitle?: ILocalizedString;
  faqSubtitle?: ILocalizedString;

  gallery?: IGalleryItem[];
  galleryTitle?: ILocalizedString;
  gallerySubtitle?: ILocalizedString;

  ctaBgImage?: string;
  ctaTitle?: ILocalizedString;
  ctaText?: ILocalizedString;
  ctaBtn?: ILocalizedString;
  seatsLabel?: ILocalizedString;
  seatsRemaining?: number;

  relatedBlogs?: IRelatedBlog[];

  seoTitle?: ILocalizedString;
  seoDescription?: ILocalizedString;
  seoKeywords?: ILocalizedMixed;
  canonicalPath?: string;

  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IDestinationListItem {
  _id: string;
  slug: string;
  name: ILocalizedString;
  heroImage: string;
  isActive: boolean;
  countryFlag?: string;
  primaryColor?: string;
  viewCount: number;
  updatedAt: string;
}

// ─── Blog types ───────────────────────────────────────────────────────────────

export interface IBlog {
  _id: string;
  slug: string;
  title: ILocalizedString;
  excerpt?: ILocalizedString;
  body?: ILocalizedMixed;
  coverImage?: string;
  author?: string;
  publishedAt?: string;
  readTime?: number;
  tags?: string[];
  destinationSlugs?: string[];
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  seoTitle?: ILocalizedString;
  seoDescription?: ILocalizedString;
  seoKeywords?: ILocalizedString;
  seoImage?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const destinationService = {
  async getBySlug(slug: string): Promise<IDestination> {
    const { data } = await api.get(`/destinations/slug/${slug}`);
    return data.data;
  },

  async list(params?: { isActive?: boolean; search?: string }): Promise<IDestinationListItem[]> {
    const { data } = await api.get('/destinations', { params });
    return data.data;
  },

  async getById(id: string): Promise<IDestination> {
    const { data } = await api.get(`/destinations/${id}`);
    return data.data;
  },

  async create(payload: any): Promise<IDestination> {
    const { data } = await api.post('/destinations', payload);
    return data.data;
  },

  async update(id: string, payload: any): Promise<IDestination> {
    const { data } = await api.put(`/destinations/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/destinations/${id}`);
  },

  async toggleActive(id: string): Promise<{ isActive: boolean }> {
    const { data } = await api.patch(`/destinations/${id}/toggle-active`);
    return data.data;
  },
};

export const blogService = {
  async list(params?: {
    destination?: string;
    page?: number;
    limit?: number;
    isPublished?: boolean;
    search?: string;
  }): Promise<{ blogs: IBlog[]; pagination: any }> {
    const { data } = await api.get('/blogs', { params });
    return { blogs: data.blogs, pagination: data.pagination };
  },

  async getBySlug(slug: string): Promise<IBlog> {
    const { data } = await api.get(`/blogs/slug/${slug}`);
    return data.data;
  },

  async getById(id: string): Promise<IBlog> {
    const { data } = await api.get(`/blogs/${id}`);
    return data.data;
  },

  async create(payload: any): Promise<IBlog> {
    const { data } = await api.post('/blogs', payload);
    return data.data;
  },

  async update(id: string, payload: any): Promise<IBlog> {
    const { data } = await api.put(`/blogs/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/blogs/${id}`);
  },

  async togglePublished(id: string): Promise<{ isPublished: boolean }> {
    const { data } = await api.patch(`/blogs/${id}/toggle-published`);
    return data.data;
  },
};
