import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('destinations')
@ApiBearerAuth()
@Controller('destinations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List destinations (public)' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query() query: any) {
    const data = await this.destinationsService.findAll(query);
    return { success: true, data };
  }

  @Get('stats')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get destination statistics' })
  async getStats() {
    const data = await this.destinationsService.getStats();
    return { success: true, data };
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get destination by slug (public)' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.destinationsService.findBySlug(slug);
    return { success: true, data };
  }

  @Get(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get destination by ID (admin)' })
  async findById(@Param('id') id: string) {
    const data = await this.destinationsService.findById(id);
    return { success: true, data };
  }

  @Post()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Create destination' })
  async create(@Body() dto: any) {
    const data = await this.destinationsService.create(dto);
    return { success: true, message: 'Destination created', data };
  }

  @Put(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Update destination by ID' })
  async update(@Param('id') id: string, @Body() dto: any) {
    const data = await this.destinationsService.update(id, dto);
    return { success: true, message: 'Destination updated', data };
  }

  @Patch(':id/toggle-active')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Toggle destination active status' })
  async toggleActive(@Param('id') id: string) {
    const data = await this.destinationsService.toggleActive(id);
    return { success: true, message: `Destination ${data.isActive ? 'activated' : 'deactivated'}`, data };
  }

  @Delete(':id')
  @Roles('superadmin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete destination (superadmin)' })
  async remove(@Param('id') id: string) {
    await this.destinationsService.remove(id);
    return { success: true, message: 'Destination deleted' };
  }
}
