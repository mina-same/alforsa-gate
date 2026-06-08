import { Schema } from 'mongoose';
import { LocalizedStringSchema, LocalizedMixedSchema, ILocalizedString, ILocalizedMixed } from './localized.schema';

export interface IFAQ {
  question: ILocalizedString;
  answer: ILocalizedMixed;
}

export const FAQSchema = new Schema(
  {
    question: { type: LocalizedStringSchema, required: true },
    answer: { type: LocalizedMixedSchema, required: true },
  },
  { _id: false },
);
