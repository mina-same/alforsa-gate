import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Destination, DestinationDocument } from './schemas/destination.schema';

@Injectable()
export class DestinationsService {
  constructor(
    @InjectModel(Destination.name)
    private destinationModel: Model<DestinationDocument>,
  ) {}

  async findAll(query: { isActive?: string; search?: string } = {}) {
    const filter: any = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.search) filter.$or = [
      { 'name.en': { $regex: query.search, $options: 'i' } },
      { 'name.ar': { $regex: query.search, $options: 'i' } },
      { slug: { $regex: query.search, $options: 'i' } },
    ];

    return this.destinationModel
      .find(filter)
      .select('slug name heroImage isActive countryFlag primaryColor viewCount updatedAt')
      .sort({ createdAt: -1 });
  }

  async findBySlug(slug: string) {
    const dest = await this.destinationModel.findOne({ slug: slug.toLowerCase() });
    if (!dest) throw new NotFoundException(`Destination "${slug}" not found`);

    this.destinationModel
      .findByIdAndUpdate(dest._id, { $inc: { viewCount: 1 } })
      .exec()
      .catch(() => {});

    return dest;
  }

  async findById(id: string) {
    const dest = await this.destinationModel.findById(id);
    if (!dest) throw new NotFoundException('Destination not found');
    return dest;
  }

  async create(dto: any) {
    if (dto.slug) dto.slug = dto.slug.toLowerCase().trim();
    return this.destinationModel.create(dto);
  }

  async update(id: string, dto: any) {
    if (dto.slug) dto.slug = dto.slug.toLowerCase().trim();
    delete dto.viewCount;
    delete dto.createdAt;

    const dest = await this.destinationModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!dest) throw new NotFoundException('Destination not found');
    return dest;
  }

  async updateBySlug(slug: string, dto: any) {
    if (dto.slug) dto.slug = dto.slug.toLowerCase().trim();
    delete dto.viewCount;

    const dest = await this.destinationModel.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!dest) throw new NotFoundException(`Destination "${slug}" not found`);
    return dest;
  }

  async toggleActive(id: string) {
    const dest = await this.destinationModel.findById(id);
    if (!dest) throw new NotFoundException('Destination not found');
    dest.isActive = !dest.isActive;
    await dest.save();
    return dest;
  }

  async remove(id: string) {
    const dest = await this.destinationModel.findByIdAndDelete(id);
    if (!dest) throw new NotFoundException('Destination not found');
    return dest;
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.destinationModel.countDocuments(),
      this.destinationModel.countDocuments({ isActive: true }),
    ]);
    return { total, active, inactive: total - active };
  }
}
