import { Schema } from 'mongoose';

export interface ILocalizedString {
  en: string;
  ar?: string;
}

export interface ILocalizedMixed {
  en: any;
  ar?: any;
}

export const LocalizedStringSchema = new Schema<ILocalizedString>(
  {
    en: { type: String, required: [true, 'English value is required'], trim: true },
    ar: { type: String, trim: true },
  },
  { _id: false }
);

export const LocalizedMixedSchema = new Schema<ILocalizedMixed>(
  {
    en: { type: Schema.Types.Mixed },
    ar: { type: Schema.Types.Mixed },
  },
  { _id: false }
);
