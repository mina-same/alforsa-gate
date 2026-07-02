import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  LocalizedStringSchema,
  LocalizedMixedSchema,
  ILocalizedString,
  ILocalizedMixed,
} from '../../common/schemas/localized.schema';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Blog {
  @Prop({ type: String, required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  title: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  excerpt: ILocalizedString;

  @Prop({ type: LocalizedMixedSchema })
  body: ILocalizedMixed; // rich text / HTML per language

  @Prop({ type: String, trim: true })
  coverImage: string;

  @Prop({ type: String, trim: true, default: 'Alforsa Gate' })
  author: string;

  @Prop({ type: Date })
  publishedAt: Date;

  @Prop({ type: Number, default: 5 })
  readTime: number; // minutes

  @Prop({ type: [String], default: [] })
  tags: string[];

  // destination slugs this blog belongs to (e.g. ["russia", "europe"])
  @Prop({ type: [String], default: [] })
  destinationSlugs: string[];

  @Prop({ type: Boolean, default: false })
  isPublished: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Number, default: 0 })
  viewCount: number;

  // ── SEO ────────────────────────────────────────────────────────────────────
  @Prop({ type: LocalizedStringSchema })
  seoTitle: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  seoDescription: ILocalizedString;

  @Prop({ type: LocalizedStringSchema })
  seoKeywords: ILocalizedString;

  @Prop({ type: String, trim: true })
  seoImage: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.index({ slug: 1 });
BlogSchema.index({ destinationSlugs: 1 });
BlogSchema.index({ isPublished: 1 });
BlogSchema.index({ publishedAt: -1 });
