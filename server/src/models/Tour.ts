import mongoose, { Schema, Document } from 'mongoose';
import { IFAQ, FAQSchema } from './shared/FaqSchema';
import { IImage, ImageSchema } from './shared/ImageSchema';
import {
  ILocalizedString,
  ILocalizedMixed,
  LocalizedStringSchema,
  LocalizedMixedSchema,
} from './shared/LocalizedSchema';

export { IImage };

// ==================== INTERFACES ====================

export interface IDescription {
  header: ILocalizedString;
  text: ILocalizedMixed;
}

export interface INote {
  title: ILocalizedString;
  text: ILocalizedMixed;
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

export interface ITourDocument {
  url: string;
  label: ILocalizedString;
}

export interface IPrices {
  solo?: ICurrencyPrice;
  pax_2_4?: ICurrencyPrice;
  pax_5_8?: ICurrencyPrice;
  pax_9_16?: ICurrencyPrice;
}

export interface ISeason {
  seasonName: string;
  startDate?: Date;
  endDate?: Date;
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

export interface IBlogReference {
  id: string;
  title: ILocalizedString;
}

export interface IRelatedTour {
  id: string;
  title: ILocalizedString;
}

export interface IReview {
  type: 'youtube' | 'text' | 'video';
  url?: string;
  title: ILocalizedString;
  content?: ILocalizedMixed;
}

export interface IGeoCoordinates {
  '@type': string;
  latitude: string;
  longitude: string;
}

export interface IPostalAddress {
  '@type': string;
  addressLocality: string;
  addressCountry: string;
}

export interface ITouristAttraction {
  '@type': string;
  position: number;
  name: string;
  description: any;
  geo: IGeoCoordinates;
  address: IPostalAddress;
}

export interface IMapSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  itemListOrder: string;
  itemListElement: ITouristAttraction[];
}

export interface ISEO {
  metaTitle?: ILocalizedString;
  metaDescription?: ILocalizedString;
  metaKeywords?: ILocalizedMixed;
  metaImage?: IImage;
  mapSchema?: IMapSchema;
}

export interface ITour extends Document {
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
  mapSchema?: IMapSchema;
  whatYouWillLoveHtml?: ILocalizedMixed;
  itinerary?: IItinerary;
  faqs?: IFAQ[];
  blogReferences?: IBlogReference[];
  relatedTours?: IRelatedTour[];
  reviews?: IReview[];
  tourVideos?: string[];
  reviewsCount?: number;
  averageRating?: number;
  groupSize?: IGroupSize;
  tourDocuments?: ITourDocument[];
  seo?: ISEO;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SUB-SCHEMAS ====================

const NoteSchema = new Schema<INote>(
  {
    title: { type: LocalizedStringSchema, required: true },
    text:  { type: LocalizedMixedSchema,  required: true },
  },
  { _id: false }
);

const DescriptionSchema = new Schema<IDescription>(
  {
    header: { type: LocalizedStringSchema, required: [true, 'Description header is required'] },
    text:   { type: LocalizedMixedSchema,  required: [true, 'Description text is required'] },
  },
  { _id: false }
);

const CurrencyPriceSchema = new Schema<ICurrencyPrice>(
  {
    EGP: { type: Number, min: 0 },
    USD: { type: Number, min: 0 },
    SAR: { type: Number, min: 0 },
  },
  { _id: false }
);

const GroupSizeSchema = new Schema<IGroupSize>(
  {
    total:     { type: Number, default: 0, min: 0 },
    remaining: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const TourDocumentSchema = new Schema<ITourDocument>(
  {
    url:   { type: String, required: true, trim: true },
    label: { type: LocalizedStringSchema, required: true },
  },
  { _id: false }
);

const PricesSchema = new Schema<IPrices>(
  {
    solo:     CurrencyPriceSchema,
    pax_2_4:  CurrencyPriceSchema,
    pax_5_8:  CurrencyPriceSchema,
    pax_9_16: CurrencyPriceSchema,
  },
  { _id: false }
);

const SeasonSchema = new Schema<ISeason>(
  {
    seasonName: {
      type: String,
      required: [true, 'Season name is required'],
      trim: true,
      enum: {
        values: [
          '1 May 2026 – 31 August 2026',
          '1 September 2026 – 19 December 2026 / 6 January 2027 – 24 March 2027',
          '20 December 2026 – 5 January 2027 / 25 March 2027 – 15 April 2027',
        ],
        message: '{VALUE} is not a valid season name',
      },
    },
    startDate: Date,
    endDate:   Date,
    prices:    { type: PricesSchema, required: [true, 'Prices are required'] },
    notes:     [NoteSchema],
  },
  { _id: false }
);

const PricingPlanSchema = new Schema<IPricingPlan>(
  {
    planName: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      enum: {
        values: ['AFFORDABLE', 'GOLD (5 STAR STANDARD)', 'DIAMOND (5 STAR LUXURY)', 'TOUR PRICES'],
        message: '{VALUE} is not a valid plan name',
      },
    },
    seasons: {
      type: [SeasonSchema],
      validate: {
        validator: (s: ISeason[]) => s.length > 0,
        message: 'At least one season is required',
      },
    },
    notes: { type: [NoteSchema], default: [] },
  },
  { _id: false }
);

const ActivitySchema = new Schema<IActivity>(
  {
    heading:     { type: LocalizedStringSchema, required: true },
    description: { type: LocalizedMixedSchema,  required: true },
    image:       ImageSchema,
  },
  { _id: false }
);

const ItineraryDaySchema = new Schema<IItineraryDay>(
  {
    day:         { type: Number, required: true, min: 1 },
    title:       { type: LocalizedStringSchema, required: true },
    description: { type: LocalizedMixedSchema,  required: true },
    activities:  { type: [ActivitySchema], default: [] },
  },
  { _id: false }
);

const ItinerarySchema = new Schema<IItinerary>(
  {
    generalDescription: LocalizedMixedSchema,
    days: { type: [ItineraryDaySchema], default: [] },
  },
  { _id: false }
);

const BlogReferenceSchema = new Schema<IBlogReference>(
  {
    id:    { type: String, required: true, trim: true },
    title: { type: LocalizedStringSchema, required: true },
  },
  { _id: false }
);

const RelatedTourSchema = new Schema<IRelatedTour>(
  {
    id:    { type: String, required: true, trim: true },
    title: { type: LocalizedStringSchema, required: true },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReview>(
  {
    type: {
      type: String,
      required: true,
      enum: { values: ['youtube', 'text', 'video'], message: '{VALUE} is not valid' },
    },
    url:     { type: String, trim: true },
    title:   { type: LocalizedStringSchema, required: true },
    content: LocalizedMixedSchema,
  },
  { _id: false }
);

const GeoCoordinatesSchema = new Schema<IGeoCoordinates>(
  {
    '@type':   { type: String, default: 'GeoCoordinates' },
    latitude:  { type: String, required: true },
    longitude: { type: String, required: true },
  },
  { _id: false }
);

const PostalAddressSchema = new Schema<IPostalAddress>(
  {
    '@type':         { type: String, default: 'PostalAddress' },
    addressLocality: { type: String, required: true },
    addressCountry:  { type: String, required: true },
  },
  { _id: false }
);

const TouristAttractionSchema = new Schema<ITouristAttraction>(
  {
    '@type':      { type: String, default: 'TouristAttraction' },
    position:    { type: Number, required: true },
    name:        { type: String, required: true },
    description: { type: Schema.Types.Mixed, required: true },
    geo:         { type: GeoCoordinatesSchema, required: true },
    address:     { type: PostalAddressSchema, required: true },
  },
  { _id: false }
);

const MapSchemaSchema = new Schema<IMapSchema>(
  {
    '@context':    { type: String, default: 'https://schema.org' },
    '@type':       { type: String, default: 'ItemList' },
    name:          { type: String, required: true },
    description:   { type: String, required: true },
    itemListOrder: { type: String, default: 'Sequential' },
    itemListElement: { type: [TouristAttractionSchema], default: [] },
  },
  { _id: false }
);

const SEOSchema = new Schema<ISEO>(
  {
    metaTitle:       LocalizedStringSchema,
    metaDescription: LocalizedStringSchema,
    metaKeywords:    LocalizedMixedSchema,
    metaImage:       ImageSchema,
    mapSchema:       MapSchemaSchema,
  },
  { _id: false }
);

// ==================== MAIN SCHEMA ====================

const TourSchema = new Schema<ITour>(
  {
    idExternal: { type: String, trim: true, unique: true, sparse: true },

    heading: {
      type: LocalizedStringSchema,
      required: [true, 'Tour heading is required'],
    },
    headingDescription: LocalizedMixedSchema,

    slug: {
      type: LocalizedStringSchema,
      required: [true, 'Slug is required'],
    },

    Description: {
      type: DescriptionSchema,
      required: [true, 'Description is required'],
    },

    images: {
      type: [ImageSchema],
      validate: {
        validator: (imgs: IImage[]) => imgs.length > 0,
        message: 'At least one image is required',
      },
    },
    gallery: { type: [ImageSchema], default: [] },

    tourLocation:    LocalizedStringSchema,
    tourAvailability: LocalizedStringSchema,
    pickupAndDropOff: LocalizedStringSchema,
    tourType:        LocalizedStringSchema,
    tourStyle:       LocalizedStringSchema,

    tourHighlights: { type: [LocalizedMixedSchema], default: [] },

    inclusion: {
      type: [LocalizedMixedSchema],
      validate: {
        validator: (v: any[]) => !v || v.length === 0 || v.every((i) => i.en),
        message: 'Each inclusion must have an English value',
      },
    },
    exclusion: {
      type: [LocalizedMixedSchema],
      validate: {
        validator: (v: any[]) => !v || v.length === 0 || v.every((i) => i.en),
        message: 'Each exclusion must have an English value',
      },
    },

    pricingPlans:      { type: [PricingPlanSchema], default: [] },
    priceStartingFrom: CurrencyPriceSchema,

    duration:           LocalizedStringSchema,
    meetingPoint:       LocalizedStringSchema,
    cancellationPolicy: LocalizedStringSchema,

    tags:        { type: [LocalizedMixedSchema], default: [] },
    notes:       [NoteSchema],
    whatToPack:  { type: [LocalizedMixedSchema], default: [] },

    tourMapIframe: { type: String, trim: true },
    mapSchema:     MapSchemaSchema,

    whatYouWillLoveHtml: LocalizedMixedSchema,
    itinerary:           ItinerarySchema,
    faqs:                [FAQSchema],
    blogReferences:      [BlogReferenceSchema],
    relatedTours:        [RelatedTourSchema],
    reviews:             [ReviewSchema],
    tourVideos:          { type: [String], default: [] },

    reviewsCount:  { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    groupSize:     GroupSizeSchema,
    tourDocuments: { type: [TourDocumentSchema], default: [] },
    seo:          SEOSchema,

    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    viewCount:  { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================

TourSchema.index({ 'slug.en': 1 }, { unique: true, sparse: true });
TourSchema.index({ 'slug.ar': 1 }, { unique: true, sparse: true });

TourSchema.index({ isActive: 1 });
TourSchema.index({ isFeatured: 1 });
TourSchema.index({ viewCount: -1 });
TourSchema.index({ createdAt: -1 });
TourSchema.index({ isActive: 1, isFeatured: 1 });
TourSchema.index({ 'heading.en': 'text', 'Description.text.en': 'text' });

// ==================== MIDDLEWARE ====================

// Auto-populate SEO fields from tour data
TourSchema.pre<ITour>('save', function (next) {
  if (!this.seo) this.seo = {};

  if (!this.seo.metaTitle?.en) {
    this.seo.metaTitle = { en: this.heading.en, ar: this.heading.ar };
  }

  if (!this.seo.metaDescription?.en && this.Description?.text) {
    const raw = this.Description.text;
    const strip = (v: any): string =>
      typeof v === 'string' ? v.replace(/<[^>]*>/g, '').slice(0, 160) : '';
    this.seo.metaDescription = { en: strip(raw.en), ar: strip(raw.ar) };
  }

  if (!this.seo.metaImage && this.images?.length) {
    this.seo.metaImage = this.images[0];
  }

  if (!this.seo.mapSchema && this.mapSchema) {
    this.seo.mapSchema = this.mapSchema;
  }

  next();
});

// Validate season date ranges
TourSchema.pre<ITour>('save', function (next) {
  for (const plan of this.pricingPlans ?? []) {
    for (const season of plan.seasons) {
      if (season.startDate && season.endDate && season.startDate >= season.endDate) {
        return next(
          new Error(`Invalid date range in season "${season.seasonName}": start must be before end`)
        );
      }
    }
  }
  next();
});

export default mongoose.model<ITour>('Tour', TourSchema);
