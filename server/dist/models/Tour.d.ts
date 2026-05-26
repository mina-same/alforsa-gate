import mongoose, { Document } from 'mongoose';
import { IFAQ } from './shared/FaqSchema';
import { IImage } from './shared/ImageSchema';
import { ILocalizedString, ILocalizedMixed } from './shared/LocalizedSchema';
export { IImage };
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
declare const _default: mongoose.Model<ITour, {}, {}, {}, mongoose.Document<unknown, {}, ITour, {}, {}> & ITour & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Tour.d.ts.map