import { Schema, SchemaTypes } from 'mongoose';

export interface ILocalizedString {
  en: string;
  ar?: string;
}

export interface ILocalizedMixed {
  en: any;
  ar?: any;
}

export const LocalizedStringSchema = new Schema(
  {
    en: { type: String, required: true },
    ar: { type: String },
  },
  { _id: false },
);

export const LocalizedMixedSchema = new Schema(
  {
    en: { type: SchemaTypes.Mixed },
    ar: { type: SchemaTypes.Mixed },
  },
  { _id: false },
);
