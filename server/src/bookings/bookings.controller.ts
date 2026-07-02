import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit a tour booking (public)' })
  async create(@Body() dto: CreateBookingDto) {
    const data = await this.bookingsService.create(dto);
    return { success: true, message: 'Booking submitted successfully', data };
  }

  @Get('stats')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get booking statistics (admin)' })
  async getStats() {
    const data = await this.bookingsService.getStats();
    return { success: true, data };
  }

  @Get()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'List all bookings (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'pending', 'confirmed', 'cancelled'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tourId', required: false, type: String })
  async findAll(@Query() query: any) {
    const result = await this.bookingsService.findAll(query);
    return { success: true, ...result };
  }

  @Get(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get booking by ID (admin)' })
  async findOne(@Param('id') id: string) {
    const data = await this.bookingsService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id/status')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Update booking status (admin)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    const data = await this.bookingsService.updateStatus(id, dto.status);
    return { success: true, message: 'Status updated', data };
  }

  @Delete(':id')
  @Roles('superadmin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a booking (superadmin)' })
  async remove(@Param('id') id: string) {
    await this.bookingsService.remove(id);
    return { success: true, message: 'Booking deleted' };
  }
}
