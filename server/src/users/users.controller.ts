import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'List all users (paginated)' })
  async findAll(@Query() query: any) {
    const { users, pagination } = await this.usersService.findAll(query);
    // data.data → { users, pagination } — matches client userService.list
    return { success: true, data: { users, pagination } };
  }

  @Get(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    // data.data.user — matches client userService.get
    return { success: true, data: { user } };
  }

  @Post()
  @Roles('superadmin')
  @ApiOperation({ summary: 'Create user (superadmin only)' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    // data.data.user — matches client userService.create
    return { success: true, message: 'User created', data: { user } };
  }

  @Put(':id')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Update user (superadmin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    // data.data.user — matches client userService.update
    return { success: true, message: 'User updated', data: { user } };
  }

  @Patch(':id/toggle-active')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Toggle user active status (superadmin only)' })
  async toggleActive(
    @Param('id') id: string,
    @CurrentUser('_id') currentUserId: string,
  ) {
    const user = await this.usersService.toggleActive(id, String(currentUserId));
    // data.data.user — matches client userService.toggleActive
    return { success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: { user } };
  }

  @Delete(':id')
  @Roles('superadmin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (superadmin only)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('_id') currentUserId: string,
  ) {
    await this.usersService.remove(id, String(currentUserId));
    return { success: true, message: 'User deleted' };
  }
}
