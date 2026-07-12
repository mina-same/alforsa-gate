import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('tours')
@ApiBearerAuth()
@Controller('tours')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get tour by slug (public)' })
  async findBySlug(@Param('slug') slug: string) {
    const tour = await this.toursService.findBySlug(slug);
    return { success: true, data: tour };
  }

  @Get('stats')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get tour statistics' })
  async getStats() {
    const stats = await this.toursService.getStats();
    return { success: true, data: stats };
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'List active tours (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllPublic(@Query() query: any) {
    const result = await this.toursService.findAll({ ...query, isActive: 'true' });
    return { success: true, ...result };
  }

  @Get()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'List all tours (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query() query: any) {
    const result = await this.toursService.findAll(query);
    return { success: true, ...result };
  }

  @Get(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get tour by ID' })
  async findById(@Param('id') id: string) {
    const tour = await this.toursService.findById(id);
    return { success: true, data: tour };
  }

  @Post()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Create a new tour' })
  async create(@Body() dto: CreateTourDto) {
    const tour = await this.toursService.create(dto);
    return { success: true, message: 'Tour created', data: tour };
  }

  @Put(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Update a tour' })
  async update(@Param('id') id: string, @Body() dto: UpdateTourDto) {
    const tour = await this.toursService.update(id, dto);
    return { success: true, message: 'Tour updated', data: tour };
  }

  @Patch(':id/toggle-active')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Toggle tour active status' })
  async toggleActive(@Param('id') id: string) {
    const tour = await this.toursService.toggleActive(id);
    return { success: true, message: `Tour ${tour.isActive ? 'activated' : 'deactivated'}`, data: tour };
  }

  @Patch(':id/toggle-featured')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Toggle tour featured status' })
  async toggleFeatured(@Param('id') id: string) {
    const tour = await this.toursService.toggleFeatured(id);
    return { success: true, message: `Tour ${tour.isFeatured ? 'featured' : 'unfeatured'}`, data: tour };
  }

  @Delete(':id')
  @Roles('superadmin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a tour (superadmin only)' })
  async remove(@Param('id') id: string) {
    await this.toursService.remove(id);
    return { success: true, message: 'Tour deleted' };
  }
}
