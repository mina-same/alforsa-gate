"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const FaqSchema_1 = require("./shared/FaqSchema");
const ImageSchema_1 = require("./shared/ImageSchema");
const LocalizedSchema_1 = require("./shared/LocalizedSchema");
// ==================== SUB-SCHEMAS ====================
const NoteSchema = new mongoose_1.Schema({
    title: { type: LocalizedSchema_1.LocalizedStringSchema, required: true },
    text: { type: LocalizedSchema_1.LocalizedMixedSchema, required: true },
}, { _id: false });
const DescriptionSchema = new mongoose_1.Schema({
    header: { type: LocalizedSchema_1.LocalizedStringSchema, required: [true, 'Description header is required'] },
    text: { type: LocalizedSchema_1.LocalizedMixedSchema, required: [true, 'Description text is required'] },
}, { _id: false });
const CurrencyPriceSchema = new mongoose_1.Schema({
    EGP: { type: Number, min: 0 },
    USD: { type: Number, min: 0 },
    SAR: { type: Number, min: 0 },
}, { _id: false });
const GroupSizeSchema = new mongoose_1.Schema({
    total: { type: Number, default: 0, min: 0 },
    remaining: { type: Number, default: 0, min: 0 },
}, { _id: false });
const TourDocumentSchema = new mongoose_1.Schema({
    url: { type: String, required: true, trim: true },
    label: { type: LocalizedSchema_1.LocalizedStringSchema, required: true },
}, { _id: false });
const PricesSchema = new mongoose_1.Schema({
    solo: CurrencyPriceSchema,
    pax_2_4: CurrencyPriceSchema,
    pax_5_8: CurrencyPriceSchema,
    pax_9_16: CurrencyPriceSchema,
}, { _id: false });
const SeasonSchema = new mongoose_1.Schema({
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
    endDate: Date,
    prices: { type: PricesSchema, required: [true, 'Prices are required'] },
    notes: [NoteSchema],
}, { _id: false });
const PricingPlanSchema = new mongoose_1.Schema({
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
            validator: (s) => s.length > 0,
            message: 'At least one season is required',
        },
    },
    notes: { type: [NoteSchema], default: [] },
}, { _id: false });
const ActivitySchema = new mongoose_1.Schema({
    heading: { type: LocalizedSchema_1.LocalizedStringSchema, required: true },
    description: { type: LocalizedSchema_1.LocalizedMixedSchema, required: true },
    image: ImageSchema_1.ImageSchema,
}, { _id: false });
const ItineraryDaySchema = new mongoose_1.Schema({
    day: { type: Number, required: true, min: 1 },
    title: { type: LocalizedSchema_1.LocalizedStringSchema, required: true },
    description: { type: LocalizedSchema_1.LocalizedMixedSchema, required: true },
    activities: { type: [ActivitySchema], default: [] },
}, { _id: false });
const ItinerarySchema = new mongoose_1.Schema({
    generalDescription: LocalizedSchema_1.LocalizedMixedSchema,
    days: { type: [ItineraryDaySchema], default: [] },
}, { _id: false });
const BlogReferenceSchema = new mongoose_1.Schema({
    id: { type: String, required: true, trim: true },
    title: { type: LocalizedSchema_1.LocalizedStringSchema, required: true },
}, { _id: false });
const RelatedTourSchema = new mongoose_1.Schema({
    id: { type: String, required: true, trim: true },
    title: { type: LocalizedSchema_1.LocalizedStringSchema, required: true },
}, { _id: false });
const ReviewSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: { values: ['youtube', 'text', 'video'], message: '{VALUE} is not valid' },
    },
    url: { type: String, trim: true },
    title: { type: LocalizedSchema_1.LocalizedStringSchema, required: true },
    content: LocalizedSchema_1.LocalizedMixedSchema,
}, { _id: false });
const GeoCoordinatesSchema = new mongoose_1.Schema({
    '@type': { type: String, default: 'GeoCoordinates' },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
}, { _id: false });
const PostalAddressSchema = new mongoose_1.Schema({
    '@type': { type: String, default: 'PostalAddress' },
    addressLocality: { type: String, required: true },
    addressCountry: { type: String, required: true },
}, { _id: false });
const TouristAttractionSchema = new mongoose_1.Schema({
    '@type': { type: String, default: 'TouristAttraction' },
    position: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: mongoose_1.Schema.Types.Mixed, required: true },
    geo: { type: GeoCoordinatesSchema, required: true },
    address: { type: PostalAddressSchema, required: true },
}, { _id: false });
const MapSchemaSchema = new mongoose_1.Schema({
    '@context': { type: String, default: 'https://schema.org' },
    '@type': { type: String, default: 'ItemList' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    itemListOrder: { type: String, default: 'Sequential' },
    itemListElement: { type: [TouristAttractionSchema], default: [] },
}, { _id: false });
const SEOSchema = new mongoose_1.Schema({
    metaTitle: LocalizedSchema_1.LocalizedStringSchema,
    metaDescription: LocalizedSchema_1.LocalizedStringSchema,
    metaKeywords: LocalizedSchema_1.LocalizedMixedSchema,
    metaImage: ImageSchema_1.ImageSchema,
    mapSchema: MapSchemaSchema,
}, { _id: false });
// ==================== MAIN SCHEMA ====================
const TourSchema = new mongoose_1.Schema({
    idExternal: { type: String, trim: true, unique: true, sparse: true },
    heading: {
        type: LocalizedSchema_1.LocalizedStringSchema,
        required: [true, 'Tour heading is required'],
    },
    headingDescription: LocalizedSchema_1.LocalizedMixedSchema,
    slug: {
        type: LocalizedSchema_1.LocalizedStringSchema,
        required: [true, 'Slug is required'],
    },
    Description: {
        type: DescriptionSchema,
        required: [true, 'Description is required'],
    },
    images: {
        type: [ImageSchema_1.ImageSchema],
        validate: {
            validator: (imgs) => imgs.length > 0,
            message: 'At least one image is required',
        },
    },
    gallery: { type: [ImageSchema_1.ImageSchema], default: [] },
    tourLocation: LocalizedSchema_1.LocalizedStringSchema,
    tourAvailability: LocalizedSchema_1.LocalizedStringSchema,
    pickupAndDropOff: LocalizedSchema_1.LocalizedStringSchema,
    tourType: LocalizedSchema_1.LocalizedStringSchema,
    tourStyle: LocalizedSchema_1.LocalizedStringSchema,
    tourHighlights: { type: [LocalizedSchema_1.LocalizedMixedSchema], default: [] },
    inclusion: {
        type: [LocalizedSchema_1.LocalizedMixedSchema],
        validate: {
            validator: (v) => !v || v.length === 0 || v.every((i) => i.en),
            message: 'Each inclusion must have an English value',
        },
    },
    exclusion: {
        type: [LocalizedSchema_1.LocalizedMixedSchema],
        validate: {
            validator: (v) => !v || v.length === 0 || v.every((i) => i.en),
            message: 'Each exclusion must have an English value',
        },
    },
    pricingPlans: { type: [PricingPlanSchema], default: [] },
    priceStartingFrom: CurrencyPriceSchema,
    duration: LocalizedSchema_1.LocalizedStringSchema,
    meetingPoint: LocalizedSchema_1.LocalizedStringSchema,
    cancellationPolicy: LocalizedSchema_1.LocalizedStringSchema,
    tags: { type: [LocalizedSchema_1.LocalizedMixedSchema], default: [] },
    notes: [NoteSchema],
    whatToPack: { type: [LocalizedSchema_1.LocalizedMixedSchema], default: [] },
    tourMapIframe: { type: String, trim: true },
    mapSchema: MapSchemaSchema,
    whatYouWillLoveHtml: LocalizedSchema_1.LocalizedMixedSchema,
    itinerary: ItinerarySchema,
    faqs: [FaqSchema_1.FAQSchema],
    blogReferences: [BlogReferenceSchema],
    relatedTours: [RelatedTourSchema],
    reviews: [ReviewSchema],
    reviewsCount: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    groupSize: GroupSizeSchema,
    tourDocuments: { type: [TourDocumentSchema], default: [] },
    seo: SEOSchema,
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0, min: 0 },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
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
TourSchema.pre('save', function (next) {
    if (!this.seo)
        this.seo = {};
    if (!this.seo.metaTitle?.en) {
        this.seo.metaTitle = { en: this.heading.en, ar: this.heading.ar };
    }
    if (!this.seo.metaDescription?.en && this.Description?.text) {
        const raw = this.Description.text;
        const strip = (v) => typeof v === 'string' ? v.replace(/<[^>]*>/g, '').slice(0, 160) : '';
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
TourSchema.pre('save', function (next) {
    for (const plan of this.pricingPlans ?? []) {
        for (const season of plan.seasons) {
            if (season.startDate && season.endDate && season.startDate >= season.endDate) {
                return next(new Error(`Invalid date range in season "${season.seasonName}": start must be before end`));
            }
        }
    }
    next();
});
exports.default = mongoose_1.default.model('Tour', TourSchema);
//# sourceMappingURL=Tour.js.map