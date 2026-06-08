import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Tour, TourDocument } from './schemas/tour.schema';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

@Injectable()
export class ToursService {
  constructor(@InjectModel(Tour.name) private tourModel: Model<TourDocument>) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    isActive?: string;
    isFeatured?: string;
    search?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured === 'true';
    if (query.search) filter.$text = { $search: query.search };

    const [tours, total] = await Promise.all([
      this.tourModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.tourModel.countDocuments(filter),
    ]);

    return {
      tours,
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
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid tour ID');
    const tour = await this.tourModel.findById(id);
    if (!tour) throw new NotFoundException('Tour not found');
    return tour;
  }

  async findBySlug(slug: string) {
    const tour = await this.tourModel.findOne({ 'slug.en': slug });
    if (!tour) throw new NotFoundException('Tour not found');

    // Increment viewCount asynchronously (don't block the response)
    this.tourModel
      .findByIdAndUpdate(tour._id, { $inc: { viewCount: 1 } })
      .exec()
      .catch(() => {});

    return tour;
  }

  async create(dto: CreateTourDto) {
    const tour = await this.tourModel.create(dto);
    return tour;
  }

  async update(id: string, dto: UpdateTourDto) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid tour ID');

    // Protect immutable fields
    delete (dto as any).viewCount;
    delete (dto as any).createdAt;

    const tour = await this.tourModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!tour) throw new NotFoundException('Tour not found');
    return tour;
  }

  async toggleActive(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid tour ID');
    const tour = await this.tourModel.findById(id);
    if (!tour) throw new NotFoundException('Tour not found');

    tour.isActive = !tour.isActive;
    await tour.save();
    return tour;
  }

  async toggleFeatured(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid tour ID');
    const tour = await this.tourModel.findById(id);
    if (!tour) throw new NotFoundException('Tour not found');

    tour.isFeatured = !tour.isFeatured;
    await tour.save();
    return tour;
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid tour ID');
    const tour = await this.tourModel.findByIdAndDelete(id);
    if (!tour) throw new NotFoundException('Tour not found');
    return tour;
  }

  async getStats() {
    const [total, active, featured, topViewed] = await Promise.all([
      this.tourModel.countDocuments(),
      this.tourModel.countDocuments({ isActive: true }),
      this.tourModel.countDocuments({ isFeatured: true }),
      this.tourModel
        .find()
        .select('heading slug viewCount isActive')
        .sort({ viewCount: -1 })
        .limit(5),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      featured,
      topViewed,
    };
  }
}
