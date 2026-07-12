import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, SchemaTypes } from 'mongoose';
import {
  LocalizedStringSchema,
  LocalizedMixedSchema,
  ILocalizedString,
  ILocalizedMixed,
} from '../../common/schemas/localized.schema';
import { ImageSchema, IImage } from '../../common/schemas/image.schema';
import { FAQSchema, IFAQ } from '../../common/schemas/faq.schema';

export type TourDocument = Tour & Document;

// ---- Sub-schema types ----
export interface INote { title: ILocalizedString; text: ILocalizedMixed; }
export interface IDescription { header: ILocalizedString; text: ILocalizedMixed; }
export interface ICurrencyPrice { EGP?: number; USD?: number; SAR?: number; }
export interface IGroupSize { total?: number; remaining?: number; }
export interface ITourDocument { url: string; label: ILocalizedString; }
export interface IPrices { solo?: ICurrencyPrice; pax_2_4?: ICurrencyPrice; pax_5_8?: ICurrencyPrice; pax_9_16?: ICurrencyPrice; }
export interface ISeason { seasonName: string; startDate?: Date; endDate?: Date; prices: IPrices; notes?: INote[]; }
export interface IPricingPlan { planName: string; seasons: ISeason[]; notes?: INote[]; }
export interface IActivity { heading: ILocalizedString; description: ILocalizedMixed; image?: IImage; }
export interface IItineraryDay { day: number; title: ILocalizedString; description: ILocalizedMixed; activities: IActivity[]; }
export interface IItinerary { generalDescription?: ILocalizedMixed; days: IItineraryDay[]; }
export interface IBlogReference { id: string; title: ILocalizedString; }
export interface IRelatedTour { id: string; title: ILocalizedString; }
export interface IReview { type: 'youtube' | 'text' | 'video'; url?: string; title: ILocalizedString; content?: ILocalizedMixed; }
export interface ISEO { metaTitle?: ILocalizedString; metaDescription?: ILocalizedString; metaKeywords?: ILocalizedMixed; metaImage?: IImage; mapSchema?: any; }

// ---- Sub-schemas ----

export interface IExtra { label: ILocalizedString; price: ICurrencyPrice; perPerson: boolean; }

const CurrencyPriceSchema = new MongooseSchema({ EGP: { type: Number, min: 0 }, USD: { type: Number, min: 0 }, SAR: { type: Number, min: 0 } }, { _id: false });
const NoteSchema = new MongooseSchema({ title: { type: LocalizedStringSchema, required: true }, text: { type: LocalizedMixedSchema, required: true } }, { _id: false });
const DescriptionSchema = new MongooseSchema({ header: { type: LocalizedStringSchema, required: true }, text: { type: LocalizedMixedSchema, required: true } }, { _id: false });

const ExtraSchema = new MongooseSchema({
  label:     { type: LocalizedStringSchema, required: true },
  price:     { type: CurrencyPriceSchema, required: true },
  perPerson: { type: Boolean, default: false },
}, { _id: false });
const GroupSizeSchema = new MongooseSchema({ total: { type: Number, default: 0, min: 0 }, remaining: { type: Number, default: 0, min: 0 } }, { _id: false });
const TourDocumentSchema = new MongooseSchema({ url: { type: String, required: true, trim: true }, label: { type: LocalizedStringSchema, required: true } }, { _id: false });
const PricesSchema = new MongooseSchema({ solo: CurrencyPriceSchema, pax_2_4: CurrencyPriceSchema, pax_5_8: CurrencyPriceSchema, pax_9_16: CurrencyPriceSchema }, { _id: false });

const SeasonSchema = new MongooseSchema({
  seasonName: { type: String, required: true, trim: true },
  startDate: Date, endDate: Date,
  prices: { type: PricesSchema, required: true },
  notes: [NoteSchema],
}, { _id: false });

const PricingPlanSchema = new MongooseSchema({
  planName: { type: String, required: true, trim: true },
  seasons: { type: [SeasonSchema], validate: { validator: (s: any[]) => s.length > 0, message: 'At least one season is required' } },
  notes: { type: [NoteSchema], default: [] },
}, { _id: false });

const ActivitySchema = new MongooseSchema({ heading: { type: LocalizedStringSchema, required: true }, description: { type: LocalizedMixedSchema, required: true }, image: ImageSchema }, { _id: false });
const ItineraryDaySchema = new MongooseSchema({ day: { type: Number, required: true, min: 1 }, title: { type: LocalizedStringSchema, required: true }, description: { type: LocalizedMixedSchema, required: true }, activities: { type: [ActivitySchema], default: [] } }, { _id: false });
const ItinerarySchema = new MongooseSchema({ generalDescription: LocalizedMixedSchema, days: { type: [ItineraryDaySchema], default: [] } }, { _id: false });
const BlogReferenceSchema = new MongooseSchema({ id: { type: String, required: true, trim: true }, title: { type: LocalizedStringSchema, required: true } }, { _id: false });
const RelatedTourSchema = new MongooseSchema({ id: { type: String, required: true, trim: true }, title: { type: LocalizedStringSchema, required: true } }, { _id: false });
const ReviewSchema = new MongooseSchema({ type: { type: String, required: true, enum: ['youtube', 'text', 'video'] }, url: { type: String, trim: true }, title: { type: LocalizedStringSchema, required: true }, content: LocalizedMixedSchema }, { _id: false });

const GeoCoordinatesSchema = new MongooseSchema({ '@type': { type: String, default: 'GeoCoordinates' }, latitude: { type: String, required: true }, longitude: { type: String, required: true } }, { _id: false });
const PostalAddressSchema = new MongooseSchema({ '@type': { type: String, default: 'PostalAddress' }, addressLocality: { type: String, required: true }, addressCountry: { type: String, required: true } }, { _id: false });
const TouristAttractionSchema = new MongooseSchema({ '@type': { type: String, default: 'TouristAttraction' }, position: { type: Number, required: true }, name: { type: String, required: true }, description: { type: SchemaTypes.Mixed, required: true }, geo: { type: GeoCoordinatesSchema, required: true }, address: { type: PostalAddressSchema, required: true } }, { _id: false });
const MapSchemaSchema = new MongooseSchema({ '@context': { type: String, default: 'https://schema.org' }, '@type': { type: String, default: 'ItemList' }, name: { type: String, required: true }, description: { type: String, required: true }, itemListOrder: { type: String, default: 'Sequential' }, itemListElement: { type: [TouristAttractionSchema], default: [] } }, { _id: false });
const SEOSchema = new MongooseSchema({ metaTitle: LocalizedStringSchema, metaDescription: LocalizedStringSchema, metaKeywords: LocalizedMixedSchema, metaImage: ImageSchema, mapSchema: MapSchemaSchema }, { _id: false });

// ---- Main Tour class ----

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Tour {
  @Prop({ type: String, trim: true, unique: true, sparse: true })
  idExternal: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  heading: ILocalizedString;

  @Prop({ type: LocalizedMixedSchema })
  headingDescription: ILocalizedMixed;

  @Prop({ type: LocalizedStringSchema, required: true })
  slug: ILocalizedString;

  @Prop({ type: DescriptionSchema, required: true })
  Description: IDescription;

  @Prop({ type: [ImageSchema], validate: { validator: (v: any[]) => v.length > 0, message: 'At least one image required' } })
  images: IImage[];

  @Prop({ type: [ImageSchema], default: [] })
  gallery: IImage[];

  @Prop({ type: LocalizedStringSchema }) tourLocation: ILocalizedString;
  @Prop({ type: LocalizedStringSchema }) tourAvailability: ILocalizedString;
  @Prop({ type: LocalizedStringSchema }) pickupAndDropOff: ILocalizedString;
  @Prop({ type: LocalizedStringSchema }) tourType: ILocalizedString;
  @Prop({ type: LocalizedStringSchema }) tourStyle: ILocalizedString;

  @Prop({ type: [LocalizedMixedSchema], default: [] }) tourHighlights: ILocalizedMixed[];
  @Prop({ type: [LocalizedMixedSchema] }) inclusion: ILocalizedMixed[];
  @Prop({ type: [LocalizedMixedSchema] }) exclusion: ILocalizedMixed[];

  @Prop({ type: [PricingPlanSchema], default: [] }) pricingPlans: IPricingPlan[];
  @Prop({ type: CurrencyPriceSchema }) priceStartingFrom: ICurrencyPrice;

  @Prop({ type: LocalizedStringSchema }) duration: ILocalizedString;
  @Prop({ type: LocalizedStringSchema }) meetingPoint: ILocalizedString;
  @Prop({ type: LocalizedStringSchema }) cancellationPolicy: ILocalizedString;

  @Prop({ type: [LocalizedMixedSchema], default: [] }) tags: ILocalizedMixed[];
  @Prop({ type: [NoteSchema] }) notes: INote[];
  @Prop({ type: [LocalizedMixedSchema], default: [] }) whatToPack: ILocalizedMixed[];

  @Prop({ type: String, trim: true }) tourMapIframe: string;
  @Prop({ type: MapSchemaSchema }) mapSchema: any;
  @Prop({ type: ImageSchema }) scheduleImage: IImage;
  @Prop({ type: LocalizedMixedSchema }) whatYouWillLoveHtml: ILocalizedMixed;
  @Prop({ type: ItinerarySchema }) itinerary: IItinerary;

  @Prop({ type: [FAQSchema] }) faqs: IFAQ[];
  @Prop({ type: [BlogReferenceSchema] }) blogReferences: IBlogReference[];
  @Prop({ type: [RelatedTourSchema] }) relatedTours: IRelatedTour[];
  @Prop({ type: [ReviewSchema] }) reviews: IReview[];
  @Prop({ type: [String], default: [] }) tourVideos: string[];

  @Prop({ default: 0, min: 0 }) reviewsCount: number;
  @Prop({ default: 0, min: 0, max: 5 }) averageRating: number;
  @Prop({ type: GroupSizeSchema }) groupSize: IGroupSize;
  @Prop({ type: [ExtraSchema], default: [] }) extras: IExtra[];
  @Prop({ type: [TourDocumentSchema], default: [] }) tourDocuments: ITourDocument[];
  @Prop({ type: SEOSchema }) seo: ISEO;

  @Prop({ default: true }) isActive: boolean;
  @Prop({ default: false }) isFeatured: boolean;
  @Prop({ default: 0, min: 0 }) viewCount: number;
}

export const TourSchema = SchemaFactory.createForClass(Tour);

// Indexes
TourSchema.index({ 'slug.en': 1 }, { unique: true, sparse: true });
TourSchema.index({ 'slug.ar': 1 }, { unique: true, sparse: true });
TourSchema.index({ isActive: 1 });
TourSchema.index({ isFeatured: 1 });
TourSchema.index({ viewCount: -1 });
TourSchema.index({ createdAt: -1 });
TourSchema.index({ isActive: 1, isFeatured: 1 });
TourSchema.index({ 'heading.en': 'text', 'Description.text.en': 'text' });

// Auto-populate SEO fields
TourSchema.pre('save', function (next) {
  const doc = this as any;
  if (!doc.seo) doc.seo = {};
  if (!doc.seo.metaTitle?.en) doc.seo.metaTitle = { en: doc.heading.en, ar: doc.heading.ar };
  if (!doc.seo.metaDescription?.en && doc.Description?.text) {
    const strip = (v: any) => typeof v === 'string' ? v.replace(/<[^>]*>/g, '').slice(0, 160) : '';
    doc.seo.metaDescription = { en: strip(doc.Description.text.en), ar: strip(doc.Description.text.ar) };
  }
  if (!doc.seo.metaImage && doc.images?.length) doc.seo.metaImage = doc.images[0];
  if (!doc.seo.mapSchema && doc.mapSchema) doc.seo.mapSchema = doc.mapSchema;
  next();
});

// Validate season date ranges
TourSchema.pre('save', function (next) {
  const doc = this as any;
  for (const plan of doc.pricingPlans ?? []) {
    for (const season of plan.seasons) {
      if (season.startDate && season.endDate && season.startDate >= season.endDate) {
        return next(new Error(`Invalid date range in season "${season.seasonName}"`));
      }
    }
  }
  next();
});
