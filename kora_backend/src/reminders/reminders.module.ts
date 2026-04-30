import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { RemindersEmailScheduler } from './reminders-email.scheduler';

@Module({
  controllers: [RemindersController],
  providers: [RemindersService, RemindersEmailScheduler],
  exports: [RemindersService],
})
export class RemindersModule {}
