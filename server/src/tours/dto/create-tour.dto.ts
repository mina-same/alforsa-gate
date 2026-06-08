import { IsObject, IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Note: The Tour document is very large with deeply nested bilingual structures.
// Full DTO validation is delegated to Mongoose schema validators.
// Here we only enforce the top-level required fields.

export class CreateTourDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idExternal?: string;

  @ApiProperty({ example: { en: 'Grand Egypt Tour', ar: 'جولة مصر الكبرى' } })
  @IsObject()
  heading: { en: string; ar?: string };

  @ApiProperty({ example: { en: 'grand-egypt-tour', ar: 'grand-egypt-tour-ar' } })
  @IsObject()
  slug: { en: string; ar?: string };

  @ApiProperty()
  @IsObject()
  Description: { header: { en: string; ar?: string }; text: { en: any; ar?: any } };

  @ApiProperty({ type: [Object] })
  @IsArray()
  images: any[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  gallery?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  pricingPlans?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  priceStartingFrom?: any;

  @ApiPropertyOptional()
  @IsOptional()
  duration?: any;

  @ApiPropertyOptional()
  @IsOptional()
  tourLocation?: any;

  @ApiPropertyOptional()
  @IsOptional()
  tourAvailability?: any;

  @ApiPropertyOptional()
  @IsOptional()
  pickupAndDropOff?: any;

  @ApiPropertyOptional()
  @IsOptional()
  tourType?: any;

  @ApiPropertyOptional()
  @IsOptional()
  tourStyle?: any;

  @ApiPropertyOptional()
  @IsOptional()
  tourHighlights?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  inclusion?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  exclusion?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  meetingPoint?: any;

  @ApiPropertyOptional()
  @IsOptional()
  cancellationPolicy?: any;

  @ApiPropertyOptional()
  @IsOptional()
  tags?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  notes?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  whatToPack?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  tourMapIframe?: string;

  @ApiPropertyOptional()
  @IsOptional()
  mapSchema?: any;

  @ApiPropertyOptional()
  @IsOptional()
  whatYouWillLoveHtml?: any;

  @ApiPropertyOptional()
  @IsOptional()
  itinerary?: any;

  @ApiPropertyOptional()
  @IsOptional()
  faqs?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  blogReferences?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  relatedTours?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  reviews?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  groupSize?: any;

  @ApiPropertyOptional()
  @IsOptional()
  tourDocuments?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  seo?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  headingDescription?: any;
}
