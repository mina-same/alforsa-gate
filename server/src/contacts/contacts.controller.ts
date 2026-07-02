import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit contact form (public)' })
  async create(@Body() dto: CreateContactDto) {
    const data = await this.contactsService.create(dto);
    return { success: true, message: 'Message sent successfully', data };
  }

  @Get()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'List all contact messages (admin)' })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'new', 'read', 'replied'] })
  async findAll(@Query() query: any) {
    const result = await this.contactsService.findAll(query);
    return { success: true, ...result };
  }

  @Get('unread-count')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get unread contact count (admin)' })
  async getUnreadCount() {
    const count = await this.contactsService.getUnreadCount();
    return { success: true, count };
  }

  @Get(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get contact message by ID (admin)' })
  async findOne(@Param('id') id: string) {
    const data = await this.contactsService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id/status')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Update contact message status (admin)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateContactStatusDto) {
    const data = await this.contactsService.updateStatus(id, dto.status);
    return { success: true, message: 'Status updated', data };
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete contact message (admin)' })
  async remove(@Param('id') id: string) {
    await this.contactsService.remove(id);
    return { success: true, message: 'Message deleted' };
  }
}
