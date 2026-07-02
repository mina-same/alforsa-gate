import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  LocalizedStringSchema,
  LocalizedMixedSchema,
  ILocalizedString,
  ILocalizedMixed,
} from '../../common/schemas/localized.schema';
import { FAQSchema, IFAQ } from '../../common/schemas/faq.schema';
import { ImageSchema, IImage } from '../../common/schemas/image.schema';

export type DestinationDocument = Destination & Document;

// ─── Sub-interfaces ──────────────────────────────────────────────────────────

export interface IDestinationStat {
  capital: ILocalizedString;
  language: ILocalizedString;
  currency: ILocalizedString;
  bestSeason: ILocalizedString;
}

export interface IStatCounter {
  value: string;
  label: ILocalizedString;
}

export interface IAttraction {
  img: string;
  city: ILocalizedString;
  name: ILocalizedString;
  desc: ILocalizedString;
}

export interface ISeason {
  icon: string; // lucide icon name: Snowflake | Flower2 | Sun | Leaf | etc.
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

export interface IPracticalItem {
  en: string;
  ar?: string;
}

export interface IPracticalSection {
  icon: string; // lucide icon name
  title: ILocalizedString;
  items: IPracticalItem[];
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

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const StatSchema = new MongooseSchema(
  {
    capital: { type: LocalizedStringSchema, required: true },
    language: { type: LocalizedStringSchema, required: true },
    currency: { type: LocalizedStringSchema, required: true },
    bestSeason: { type: LocalizedStringSchema, required: true },
  },
  { _id: false },
);

const StatCounterSchema = new MongooseSchema(
  {
    value: { type: String, required: true },
    label: { type: LocalizedStringSchema, required: true },
  },
  { _id: false },
);

const AttractionSchema = new MongooseSchema(
  {
    img: { type: String, required: true },
    city: { type: LocalizedStringSchema, required: true },
    name: { type: LocalizedStringSchema, required: true },
    desc: { type: LocalizedStringSchema, required: true },
  },
  { _id: false },
);

const SeasonSchema = new MongooseSchema(
  {
    icon: { type: String, required: true },
    name: { type: LocalizedStringSchema, required: true },
    desc: { type: LocalizedStringSchema, required: true },
    tag: { type: LocalizedStringSchema, required: true },
    highlight: { type: Boolean, default: false },
  },
  { _id: false },
);

const FoodSchema = new MongooseSchema(
  {
    emoji: { type: String, required: true },
    name: { type: LocalizedStringSchema, required: true },
    desc: { type: LocalizedStringSchema, required: true },
  },
  { _id: false },
);

const BudgetTierSchema = new MongooseSchema(
  {
    level: { type: LocalizedStringSchema, required: true },
    range: { type: LocalizedStringSchema, required: true },
    desc: { type: LocalizedStringSchema, required: true },
  },
  { _id: false },
);

const PracticalItemSchema = new MongooseSchema(
  { en: { type: String, required: true }, ar: { type: String } },
  { _id: false },
);

const PracticalSectionSchema = new MongooseSchema(
  {
    icon: { type: String, required: true },
    title: { type: LocalizedStringSchema, required: true },
    items: { type: [PracticalItemSchema], default: [] },
  },
  { _id: false },
);

const GalleryItemSchema = new MongooseSchema(
  {
    url: { type: String, required: true },
    caption: LocalizedStringSchema,
    alt: LocalizedStringSchema,
  },
  { _id: false },
);

const RelatedBlogSchema = new MongooseSchema(
  {
    slug: { type: String, required: true },
    title: { type: LocalizedStringSchema, required: true },
    excerpt: { type: LocalizedStringSchema, required: true },
    coverImage: { type: String, required: true },
    publishedAt: { type: String, required: true },
    readTime: { type: Number },
  },
  { _id: false },
);

// ─── Main schema ─────────────────────────────────────────────────────────────

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Destination {
  @Prop({ type: String, required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: String, trim: true })
  countryFlag: string; // emoji e.g. 🇷🇺

  @Prop({ type: String, trim: true })
  primaryColor: string; // CSS color, default #0a5c44

  // ── Hero ──
  @Prop({ type: String, required: true, trim: true })
  heroImage: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  name: ILocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  subtitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  heroCta: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  heroExplore: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  heroScroll: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  heroTagline: ILocalizedString;

  // ── Stats bar ──
  @Prop({ type: StatSchema })
  stats: IDestinationStat;

  // ── About ──
  @Prop({ type: String, trim: true })
  aboutImage: string;

  @Prop({ type: LocalizedStringSchema })
  aboutTitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  aboutText: ILocalizedString;

  @Prop({ type: [StatCounterSchema], default: [] })
  statCounters: IStatCounter[];

  // ── Sections ──
  @Prop({ type: [AttractionSchema], default: [] })
  attractions: IAttraction[];

  @Prop({ type: LocalizedStringSchema })
  attractionsTitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  attractionsSubtitle: ILocalizedString;

  @Prop({ type: [SeasonSchema], default: [] })
  seasons: ISeason[];

  @Prop({ type: LocalizedStringSchema })
  seasonTitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  seasonSubtitle: ILocalizedString;

  @Prop({ type: [FoodSchema], default: [] })
  foods: IFood[];

  @Prop({ type: LocalizedStringSchema })
  foodTitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  foodSubtitle: ILocalizedString;

  @Prop({ type: [BudgetTierSchema], default: [] })
  budgets: IBudgetTier[];

  @Prop({ type: LocalizedStringSchema })
  budgetTitle: ILocalizedString;

  @Prop({ type: [PracticalSectionSchema], default: [] })
  practicalSections: IPracticalSection[];

  @Prop({ type: LocalizedStringSchema })
  practicalTitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  practicalSubtitle: ILocalizedString;

  @Prop({ type: [FAQSchema], default: [] })
  faqs: IFAQ[];

  @Prop({ type: LocalizedStringSchema })
  faqTitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  faqSubtitle: ILocalizedString;

  // ── Gallery ──
  @Prop({ type: [GalleryItemSchema], default: [] })
  gallery: IGalleryItem[];

  @Prop({ type: LocalizedStringSchema })
  galleryTitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  gallerySubtitle: ILocalizedString;

  // ── CTA ──
  @Prop({ type: String, trim: true })
  ctaBgImage: string;

  @Prop({ type: LocalizedStringSchema })
  ctaTitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  ctaText: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  ctaBtn: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  seatsLabel: ILocalizedString;

  @Prop({ type: Number, default: 30 })
  seatsRemaining: number;

  // ── Related blogs (embedded snapshot) ──
  @Prop({ type: [RelatedBlogSchema], default: [] })
  relatedBlogs: IRelatedBlog[];

  // ── SEO ──
  @Prop({ type: LocalizedStringSchema })
  seoTitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  seoDescription: ILocalizedString;

  @Prop({ type: LocalizedMixedSchema })
  seoKeywords: ILocalizedMixed;

  @Prop({ type: String, trim: true })
  canonicalPath: string;

  @Prop({ type: Number, default: 0 })
  viewCount: number;
}

export const DestinationSchema = SchemaFactory.createForClass(Destination);

DestinationSchema.index({ slug: 1 });
DestinationSchema.index({ isActive: 1 });
