import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TripsModule } from '../trips/trips.module';
import { DocumentsModule } from '../documents/documents.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [TripsModule, DocumentsModule, RemindersModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
