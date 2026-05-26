import { Schema } from 'mongoose';

export interface IImage {
  url: string;
  alt?: string | { en: string; ar?: string };
  title?: string | { en: string; ar?: string };
  width?: number;
  height?: number;
}

export const ImageSchema = new Schema<IImage>(
  {
    url:    { type: String, required: [true, 'Image URL is required'], trim: true },
    alt:    { type: Schema.Types.Mixed },
    title:  { type: Schema.Types.Mixed },
    width:  { type: Number },
    height: { type: Number },
  },
  { _id: false }
);
