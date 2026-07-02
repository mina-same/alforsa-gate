import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(dto: CreateBookingDto) {
    const suffix = Date.now().toString(36).slice(-4).toUpperCase();
    const bookingRef = `BK-${suffix}`;
    const booking = await this.bookingModel.create({ ...dto, bookingRef });
    return booking;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    tourId?: string;
  } = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.tourId) filter.tourId = query.tourId;
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ customerName: regex }, { customerEmail: regex }, { bookingRef: regex }];
    }

    const [bookings, total] = await Promise.all([
      this.bookingModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.bookingModel.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async findOne(id: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
    const booking = await this.bookingModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async remove(id: string) {
    const booking = await this.bookingModel.findByIdAndDelete(id);
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async getStats() {
    const [total, pending, confirmed, cancelled] = await Promise.all([
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ status: 'pending' }),
      this.bookingModel.countDocuments({ status: 'confirmed' }),
      this.bookingModel.countDocuments({ status: 'cancelled' }),
    ]);
    return { total, pending, confirmed, cancelled };
  }
}
