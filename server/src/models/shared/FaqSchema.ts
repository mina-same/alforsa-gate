import { Schema } from 'mongoose';
import { ILocalizedString, ILocalizedMixed, LocalizedStringSchema, LocalizedMixedSchema } from './LocalizedSchema';

export interface IFAQ {
  question: ILocalizedString;
  answer: ILocalizedMixed;
}

export const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: LocalizedStringSchema, required: [true, 'FAQ question is required'] },
    answer:   { type: LocalizedMixedSchema,  required: [true, 'FAQ answer is required'] },
  },
  { _id: false }
);
