import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import type {
  Reminder,
  RemindersResponse,
  CreateReminderDto,
  UpdateReminderDto,
} from './reminders.types';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  async getReminders(
    @Headers('x-kora-user-id') userId?: string,
  ): Promise<RemindersResponse> {
    return this.remindersService.getReminders(userId);
  }

  @Get(':id')
  async getReminder(
    @Param('id') id: string,
    @Headers('x-kora-user-id') userId?: string,
  ): Promise<Reminder> {
    return this.remindersService.getReminder(id, userId);
  }

  @Post()
  async createReminder(
    @Body() createReminderDto: CreateReminderDto,
    @Headers('x-kora-user-id') userId?: string,
  ): Promise<Reminder> {
    return this.remindersService.createReminder(createReminderDto, userId);
  }

  @Patch(':id')
  async updateReminder(
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
    @Headers('x-kora-user-id') userId?: string,
  ): Promise<Reminder> {
    return this.remindersService.updateReminder(id, updateReminderDto, userId);
  }

  @Delete(':id')
  async deleteReminder(
    @Param('id') id: string,
    @Headers('x-kora-user-id') userId?: string,
  ): Promise<{ success: boolean }> {
    await this.remindersService.deleteReminder(id, userId);
    return { success: true };
  }

  @Post('send-email')
  async sendEmailNotification(
    @Body() payload: {
      type: 'trip_reminder' | 'custom_reminder';
      user_id: string;
      user_email: string;
      title: string;
      message: string;
      reminder_id?: string;
      trip_id?: string;
    },
    @Headers('x-kora-user-id') userId?: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.remindersService.sendEmailNotification(payload, userId);
  }
}
