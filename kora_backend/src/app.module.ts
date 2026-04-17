import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LandingModule } from './landing/landing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TripsModule } from './trips/trips.module';
import { DocumentsModule } from './documents/documents.module';
import { PackingModule } from './packing/packing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    LandingModule,
    DashboardModule,
    TripsModule,
    DocumentsModule,
    PackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
