import { IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: ['pending', 'confirmed', 'cancelled'] })
  @IsNotEmpty()
  @IsIn(['pending', 'confirmed', 'cancelled'])
  status: 'pending' | 'confirmed' | 'cancelled';
}
