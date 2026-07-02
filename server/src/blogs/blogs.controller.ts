import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('blogs')
@ApiBearerAuth()
@Controller('blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List blogs (public)' })
  @ApiQuery({ name: 'destination', required: false, type: String })
  @ApiQuery({ name: 'page',        required: false, type: Number })
  @ApiQuery({ name: 'limit',       required: false, type: Number })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'search',      required: false, type: String })
  async findAll(@Query() query: any) {
    const result = await this.blogsService.findAll(query);
    return { success: true, ...result };
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get blog by slug (public)' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.blogsService.findBySlug(slug);
    return { success: true, data };
  }

  @Get(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get blog by ID (admin)' })
  async findById(@Param('id') id: string) {
    const data = await this.blogsService.findById(id);
    return { success: true, data };
  }

  @Post()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Create blog' })
  async create(@Body() dto: any) {
    const data = await this.blogsService.create(dto);
    return { success: true, message: 'Blog created', data };
  }

  @Put(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Update blog' })
  async update(@Param('id') id: string, @Body() dto: any) {
    const data = await this.blogsService.update(id, dto);
    return { success: true, message: 'Blog updated', data };
  }

  @Patch(':id/toggle-published')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Toggle blog published status' })
  async togglePublished(@Param('id') id: string) {
    const data = await this.blogsService.togglePublished(id);
    return { success: true, message: `Blog ${data.isPublished ? 'published' : 'unpublished'}`, data };
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete blog' })
  async remove(@Param('id') id: string) {
    await this.blogsService.remove(id);
    return { success: true, message: 'Blog deleted' };
  }
}
