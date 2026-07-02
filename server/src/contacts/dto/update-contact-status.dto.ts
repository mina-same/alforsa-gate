import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContactStatusDto {
  @ApiProperty({ enum: ['new', 'read', 'replied'] })
  @IsNotEmpty()
  @IsIn(['new', 'read', 'replied'])
  status: 'new' | 'read' | 'replied';
}
