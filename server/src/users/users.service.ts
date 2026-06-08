import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: string;
    search?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async findById(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid user ID');
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (exists) throw new ConflictException('Email already exists');

    const user = await this.userModel.create(dto);
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid user ID');

    const user = await this.userModel.findById(id).select('+password');
    if (!user) throw new NotFoundException('User not found');

    // Check duplicate email
    if (dto.email && dto.email !== user.email) {
      const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() });
      if (exists) throw new ConflictException('Email already exists');
    }

    // Prevent demoting last active superadmin
    if (dto.role && dto.role !== 'superadmin' && user.role === 'superadmin') {
      const superadminCount = await this.userModel.countDocuments({
        role: 'superadmin',
        isActive: true,
        _id: { $ne: id },
      });
      if (superadminCount === 0) {
        throw new ForbiddenException('Cannot demote the last active superadmin');
      }
    }

    if (dto.name) user.name = dto.name;
    if (dto.email) user.email = dto.email;
    if (dto.role) user.role = dto.role as any;
    if (dto.password) user.password = dto.password; // pre-save hook will hash it

    await user.save();
    return user;
  }

  async toggleActive(id: string, currentUserId: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid user ID');

    if (id === currentUserId) {
      throw new ForbiddenException('You cannot deactivate your own account');
    }

    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    // Prevent deactivating last active superadmin
    if (user.isActive && user.role === 'superadmin') {
      const superadminCount = await this.userModel.countDocuments({
        role: 'superadmin',
        isActive: true,
        _id: { $ne: id },
      });
      if (superadminCount === 0) {
        throw new ForbiddenException('Cannot deactivate the last active superadmin');
      }
    }

    user.isActive = !user.isActive;
    await user.save();
    return user;
  }

  async remove(id: string, currentUserId: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid user ID');

    if (id === currentUserId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    // Prevent deleting last superadmin
    if (user.role === 'superadmin') {
      const superadminCount = await this.userModel.countDocuments({
        role: 'superadmin',
        _id: { $ne: id },
      });
      if (superadminCount === 0) {
        throw new ForbiddenException('Cannot delete the last superadmin');
      }
    }

    await this.userModel.findByIdAndDelete(id);
    return user;
  }
}
