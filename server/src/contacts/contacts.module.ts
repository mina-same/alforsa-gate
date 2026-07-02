import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { Contact, ContactSchema } from './schemas/contact.schema';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
    forwardRef(() => EventsModule),
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
