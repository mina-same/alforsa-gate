import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ToursModule } from './tours/tours.module';
import { UsersModule } from './users/users.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    // Config (global)
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting: 200 req / 15 min globally
    ThrottlerModule.forRoot([
      {
        ttl: 900000,
        limit: 200,
      },
    ]),

    // Database
    DatabaseModule,

    // Feature modules
    AuthModule,
    ToursModule,
    UsersModule,
    WhatsAppModule,
  ],
})
export class AppModule {}
