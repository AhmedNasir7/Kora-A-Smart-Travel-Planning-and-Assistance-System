import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Reminder,
  ReminderSummary,
  RemindersResponse,
  CreateReminderDto,
  UpdateReminderDto,
} from './reminders.types';

@Injectable()
export class RemindersService {
  private readonly supabase: SupabaseClient | null;
  private readonly configErrorMessage: string | null;
  private readonly defaultUserId: string | null;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const serviceRoleKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey =
      this.configService.get<string>('SUPABASE_ANON_KEY') ||
      this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
      '';

    const supabaseKey = serviceRoleKey || anonKey;
    const hasPlaceholderUrl =
      supabaseUrl.includes('your-project.supabase.co') ||
      supabaseUrl.includes('example.supabase.co');
    const hasPlaceholderKey =
      supabaseKey.includes('your-service-role-key') ||
      supabaseKey.includes('your-anon-key') ||
      supabaseKey.includes('replace-with-your-service-role-key') ||
      supabaseKey.includes('your-publishable-key');

    this.defaultUserId = this.configService.get<string>('KORA_DEFAULT_USER_ID') || null;

    if (
      !supabaseUrl ||
      !supabaseKey ||
      hasPlaceholderUrl ||
      hasPlaceholderKey
    ) {
      this.supabase = null;
      this.configErrorMessage =
        'Invalid Supabase configuration. Set SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in backend .env with real values from your Supabase project.';
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.configErrorMessage = null;
  }

  async getReminders(requestUserId?: string): Promise<RemindersResponse> {
    const ownerUserId = this.resolveRequestUserId(requestUserId);

    if (!this.supabase) {
      return {
        items: [],
        summary: { total: 0, urgent: 0, pending: 0, completed: 0 },
      };
    }

    const { data, error } = await this.supabase
      .from('reminders')
      .select('*')
      .eq('user_id', ownerUserId)
      .order('due_date', { ascending: true });

    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    const reminders = (data || []) as Reminder[];

    const summary: ReminderSummary = {
      total: reminders.length,
      urgent: reminders.filter((r) => r.urgency === 'high' && !r.is_completed)
        .length,
      pending: reminders.filter((r) => !r.is_completed).length,
      completed: reminders.filter((r) => r.is_completed).length,
    };

    return { items: reminders, summary };
  }

  async getReminder(id: string, requestUserId?: string): Promise<Reminder> {
    const ownerUserId = this.resolveRequestUserId(requestUserId);

    if (!this.supabase) {
      throw new NotFoundException('Reminder not found');
    }

    const { data, error } = await this.supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .eq('user_id', ownerUserId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Reminder not found');
    }

    return data as Reminder;
  }

  async createReminder(
    createReminderDto: CreateReminderDto,
    requestUserId?: string,
  ): Promise<Reminder> {
    const ownerUserId = this.resolveRequestUserId(requestUserId);

    if (!this.supabase) {
      throw new ServiceUnavailableException('Database not available');
    }

    const { data, error } = await this.supabase
      .from('reminders')
      .insert({
        user_id: ownerUserId,
        title: createReminderDto.title,
        description: createReminderDto.description,
        due_date: createReminderDto.due_date,
        urgency: createReminderDto.urgency || 'medium',
        trip_id: createReminderDto.trip_id,
        is_completed: false,
      })
      .select()
      .single();

    if (error || !data) {
      throw new ServiceUnavailableException(error?.message || 'Failed to create reminder');
    }

    return data as Reminder;
  }

  async updateReminder(
    id: string,
    updateReminderDto: UpdateReminderDto,
    requestUserId?: string,
  ): Promise<Reminder> {
    const ownerUserId = this.resolveRequestUserId(requestUserId);

    if (!this.supabase) {
      throw new ServiceUnavailableException('Database not available');
    }

    const { data, error } = await this.supabase
      .from('reminders')
      .update(updateReminderDto)
      .eq('id', id)
      .eq('user_id', ownerUserId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Reminder not found or update failed');
    }

    return data as Reminder;
  }

  async deleteReminder(id: string, requestUserId?: string): Promise<void> {
    const ownerUserId = this.resolveRequestUserId(requestUserId);

    if (!this.supabase) {
      throw new ServiceUnavailableException('Database not available');
    }

    const { error } = await this.supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', ownerUserId);

    if (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }

  private resolveRequestUserId(requestUserId?: string): string {
    if (requestUserId && requestUserId.trim() && requestUserId !== 'undefined' && requestUserId !== 'null') {
      return requestUserId;
    }

    if (this.defaultUserId) {
      return this.defaultUserId;
    }

    throw new ServiceUnavailableException('No user context available');
  }
}
