import { IsString, IsEmail, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  website?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
