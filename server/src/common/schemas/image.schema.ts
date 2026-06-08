import { Schema } from 'mongoose';
import { LocalizedMixedSchema, ILocalizedMixed } from './localized.schema';

export interface IImage {
  url: string;
  alt?: ILocalizedMixed;
  title?: ILocalizedMixed;
  width?: number;
  height?: number;
}

export const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: LocalizedMixedSchema },
    title: { type: LocalizedMixedSchema },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false },
);
