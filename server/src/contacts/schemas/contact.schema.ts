import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

export type ContactStatus = 'new' | 'read' | 'replied';

@Schema({ timestamps: true })
export class Contact {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ type: String, trim: true, default: '' })
  website: string;

  @Prop({ type: String, required: true, trim: true })
  message: string;

  @Prop({ type: String, enum: ['new', 'read', 'replied'], default: 'new' })
  status: ContactStatus;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

ContactSchema.index({ status: 1 });
ContactSchema.index({ createdAt: -1 });
