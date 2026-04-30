import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RemindersService } from './reminders.service';

@Injectable()
export class RemindersEmailScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RemindersEmailScheduler.name);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly remindersService: RemindersService) {}

  onModuleInit() {
    void this.runOnce();
    this.intervalId = setInterval(() => {
      void this.runOnce();
    }, 60 * 1000);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async runOnce() {
    try {
      const result = await this.remindersService.processDueReminderEmails();
      if (result.checked > 0) {
        this.logger.log(
          `Reminder email sweep complete: checked=${result.checked}, sent=${result.sent}, skipped=${result.skipped}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Reminder email sweep failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}