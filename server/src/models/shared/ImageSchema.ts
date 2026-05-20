import { Schema } from 'mongoose';

export interface IImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export const ImageSchema = new Schema<IImage>(
  {
    url:    { type: String, required: [true, 'Image URL is required'], trim: true },
    alt:    { type: String, trim: true },
    width:  { type: Number },
    height: { type: Number },
  },
  { _id: false }
);
