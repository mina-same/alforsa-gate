import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';

@Injectable()
export class BlogsService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    destination?: string;
    isPublished?: string;
    search?: string;
  } = {}) {
    const page  = Math.max(1, query.page  || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip  = (page - 1) * limit;

    const filter: any = {};
    if (query.isPublished !== undefined) filter.isPublished = query.isPublished === 'true';
    if (query.destination) filter.destinationSlugs = query.destination;
    if (query.search) filter.$or = [
      { 'title.en': { $regex: query.search, $options: 'i' } },
      { 'title.ar': { $regex: query.search, $options: 'i' } },
    ];

    const [blogs, total] = await Promise.all([
      this.blogModel.find(filter).skip(skip).limit(limit).sort({ publishedAt: -1 }),
      this.blogModel.countDocuments(filter),
    ]);

    return {
      blogs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string) {
    const blog = await this.blogModel.findOne({ slug: slug.toLowerCase() });
    if (!blog) throw new NotFoundException(`Blog "${slug}" not found`);

    this.blogModel.findByIdAndUpdate(blog._id, { $inc: { viewCount: 1 } }).exec().catch(() => {});
    return blog;
  }

  async findById(id: string) {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async create(dto: any) {
    if (dto.slug) dto.slug = dto.slug.toLowerCase().trim();
    return this.blogModel.create(dto);
  }

  async update(id: string, dto: any) {
    if (dto.slug) dto.slug = dto.slug.toLowerCase().trim();
    delete dto.viewCount;

    const blog = await this.blogModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async togglePublished(id: string) {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    blog.isPublished = !blog.isPublished;
    if (blog.isPublished && !blog.publishedAt) blog.publishedAt = new Date();
    await blog.save();
    return blog;
  }

  async remove(id: string) {
    const blog = await this.blogModel.findByIdAndDelete(id);
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }
}
