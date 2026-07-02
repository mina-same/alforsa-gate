import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsDateString,
  IsArray,
  IsIn,
  IsObject,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: '665abc123def456789012345' })
  @IsMongoId()
  @IsNotEmpty()
  tourId: string;

  @ApiProperty({ example: { en: 'Grand Egypt Tour', ar: 'جولة مصر الكبرى' } })
  @IsObject()
  tourName: { en: string; ar?: string };

  @ApiProperty({ example: 'grand-egypt-tour' })
  @IsString()
  @IsNotEmpty()
  tourSlug: string;

  @ApiProperty({ example: 'Ahmed Ali' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @ApiPropertyOptional({ example: '+201012345678' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  customerPhone?: string;

  @ApiProperty({ example: '2026-08-15' })
  @IsDateString()
  @IsNotEmpty()
  travelDate: string;

  @ApiProperty({ enum: ['12:00', '19:00'], example: '12:00' })
  @IsIn(['12:00', '19:00'])
  travelTime: '12:00' | '19:00';

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  adults: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  youth: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  children: number;

  @ApiPropertyOptional({ example: [{ label: 'Service per booking', price: 30 }] })
  @IsArray()
  @IsOptional()
  extras?: Array<{ label: string; price: number }>;

  @ApiProperty({ example: 340 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ example: 'Vegetarian meals preferred' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
