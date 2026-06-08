import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class SendMessageDto {
  @ApiProperty({ example: '201234567890' })
  @IsString() @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Hello from Alforsa!' })
  @IsString() @IsNotEmpty()
  message: string;
}

@ApiTags('whatsapp')
@ApiBearerAuth()
@Controller('whatsapp')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WhatsAppController {
  constructor(private readonly wa: WhatsAppService) {}

  @Get('status')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get WhatsApp session status' })
  async status() {
    const info = await this.wa.getSessionStatus();
    return { success: true, data: { enabled: this.wa.isEnabled, session: info } };
  }

  @Get('qr')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get WhatsApp QR code for session authentication' })
  async qr() {
    const result = await this.wa.getQRCode();
    return { success: !!result, data: result };
  }

  @Post('send')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Send a WhatsApp message (admin only)' })
  async send(@Body() dto: SendMessageDto) {
    const ok = await this.wa.sendText({ to: dto.to, message: dto.message });
    return { success: ok, message: ok ? 'Message sent' : 'Failed to send' };
  }
}
