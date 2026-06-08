import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { RolesGuard } from './auth/roles.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UserThrottlerGuard } from './common/throttler/user-throttler.guard';
import { ReportsModule } from './reports/reports.module';
import { ExternalModule } from './external/external.module';
import { SettingsModule } from './settings/settings.module';
import { DriveModule } from './drive/drive.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000, // window: 60 seconds (in milliseconds)
          limit: 100, // max requests per window per user
        },
      ],
    }),
    UsersModule,
    DatabaseModule,
    AuthModule,
    ReportsModule,
    ExternalModule,
    SettingsModule,
    DriveModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [
    // Order matters: JwtAuthGuard runs first and attaches req.user, which the
    // throttler then reads to key the limit per user. (If the throttler ran
    // first, req.user wouldn't exist yet and every request would fall back to
    // the IP key.) RolesGuard runs last, once identity is established.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: UserThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    AppService,
  ],
})
export class AppModule {}
