import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @Inject(forwardRef(() => EventsGateway)) private eventsGateway: EventsGateway,
  ) {}

  async create(dto: CreateContactDto) {
    const contact = await this.contactModel.create(dto);
    this.eventsGateway.emitNewContact(contact.toObject());
    return contact;
  }

  async findAll(query: { page?: number; limit?: number; status?: string } = {}) {
    const page  = Math.max(1, query.page  || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip  = (page - 1) * limit;

    const filter: any = {};
    if (query.status && query.status !== 'all') filter.status = query.status;

    const [contacts, total] = await Promise.all([
      this.contactModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.contactModel.countDocuments(filter),
    ]);

    return {
      contacts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const contact = await this.contactModel.findById(id);
    if (!contact) throw new NotFoundException('Contact message not found');
    return contact;
  }

  async updateStatus(id: string, status: 'new' | 'read' | 'replied') {
    const contact = await this.contactModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );
    if (!contact) throw new NotFoundException('Contact message not found');
    return contact;
  }

  async remove(id: string) {
    const contact = await this.contactModel.findByIdAndDelete(id);
    if (!contact) throw new NotFoundException('Contact message not found');
    return contact;
  }

  async getUnreadCount() {
    return this.contactModel.countDocuments({ status: 'new' });
  }
}
