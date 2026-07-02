import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: String, unique: true, trim: true })
  bookingRef: string;

  @Prop({ type: Types.ObjectId, ref: 'Tour', required: true })
  tourId: Types.ObjectId;

  @Prop({ type: Object, required: true })
  tourName: { en: string; ar?: string };

  @Prop({ type: String, trim: true })
  tourSlug: string;

  @Prop({ type: String, required: true, trim: true })
  customerName: string;

  @Prop({ type: String, required: true, trim: true, lowercase: true })
  customerEmail: string;

  @Prop({ type: String, trim: true, default: '' })
  customerPhone: string;

  @Prop({ type: Date, required: true })
  travelDate: Date;

  @Prop({ type: String, enum: ['12:00', '19:00'], default: '12:00' })
  travelTime: string;

  @Prop({ type: Number, default: 0 })
  adults: number;

  @Prop({ type: Number, default: 0 })
  youth: number;

  @Prop({ type: Number, default: 0 })
  children: number;

  @Prop({ type: [{ label: String, price: Number }], default: [] })
  extras: Array<{ label: string; price: number }>;

  @Prop({ type: Number, default: 0 })
  totalAmount: number;

  @Prop({ type: String, trim: true, default: '' })
  notes: string;

  @Prop({ type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' })
  status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ status: 1 });
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ tourId: 1 });
