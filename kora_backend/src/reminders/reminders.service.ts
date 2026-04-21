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
  private readonly fallbackReminders = new Map<string, Reminder[]>();

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
    this.assertUserScope(ownerUserId);

    if (!this.supabase) {
      const reminders = this.getFallbackReminders(ownerUserId).sort(
        (left, right) => left.due_date.localeCompare(right.due_date),
      );

      return {
        items: reminders,
        summary: {
          total: reminders.length,
          urgent: reminders.filter((reminder) => reminder.urgency === 'high' && !reminder.is_completed)
            .length,
          pending: reminders.filter((reminder) => !reminder.is_completed).length,
          completed: reminders.filter((reminder) => reminder.is_completed).length,
        },
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
    this.assertUserScope(ownerUserId);

    if (!this.supabase) {
      const reminder = this.getFallbackReminders(ownerUserId).find((item) => item.id === id);
      if (!reminder) {
        throw new NotFoundException('Reminder not found');
      }

      return reminder;
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
    const normalizedTripId = this.normalizeOptionalTripId(createReminderDto.trip_id);
    const ownerUserId = this.resolveRequestUserId(requestUserId);
    this.assertUserScope(ownerUserId);

    if (!this.supabase) {
      const now = new Date().toISOString();
      const reminder: Reminder = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        user_id: ownerUserId,
        trip_id: normalizedTripId || undefined,
        title: createReminderDto.title,
        description: createReminderDto.description,
        due_date: createReminderDto.due_date,
        urgency: createReminderDto.urgency || 'medium',
        is_completed: false,
        created_at: now,
        updated_at: now,
      };

      this.fallbackReminders.set(ownerUserId, [reminder, ...this.getFallbackReminders(ownerUserId)]);
      return reminder;
    }

    const { data, error } = await this.supabase
      .from('reminders')
      .insert({
        user_id: ownerUserId,
        title: createReminderDto.title,
        description: createReminderDto.description,
        due_date: createReminderDto.due_date,
        urgency: createReminderDto.urgency || 'medium',
        trip_id: normalizedTripId,
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
    const normalizedTripId = this.normalizeOptionalTripId(updateReminderDto.trip_id);
    const ownerUserId = this.resolveRequestUserId(requestUserId);
    this.assertUserScope(ownerUserId);

    if (!this.supabase) {
      const reminders = this.getFallbackReminders(ownerUserId);
      const existing = reminders.find((item) => item.id === id);
      if (!existing) {
        throw new NotFoundException('Reminder not found or update failed');
      }

      const updated: Reminder = {
        ...existing,
        title: updateReminderDto.title ?? existing.title,
        description: updateReminderDto.description ?? existing.description,
        due_date: updateReminderDto.due_date ?? existing.due_date,
        urgency: updateReminderDto.urgency ?? existing.urgency,
        trip_id: normalizedTripId ?? existing.trip_id,
        is_completed: updateReminderDto.is_completed ?? existing.is_completed,
        updated_at: new Date().toISOString(),
      };

      this.fallbackReminders.set(
        ownerUserId,
        reminders.map((item) => (item.id === id ? updated : item)),
      );

      return updated;
    }

    const { data, error } = await this.supabase
      .from('reminders')
      .update({
        ...updateReminderDto,
        trip_id: normalizedTripId,
      })
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
    this.assertUserScope(ownerUserId);

    if (!this.supabase) {
      const reminders = this.getFallbackReminders(ownerUserId);
      const nextReminders = reminders.filter((item) => item.id !== id);

      if (nextReminders.length === reminders.length) {
        throw new NotFoundException('Reminder not found');
      }

      this.fallbackReminders.set(ownerUserId, nextReminders);
      return;
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

  private resolveRequestUserId(requestUserId?: string): string | null {
    if (requestUserId && requestUserId.trim() && requestUserId !== 'undefined' && requestUserId !== 'null') {
      return requestUserId;
    }

    return null;
  }

  private normalizeOptionalTripId(tripId?: string | null): string | null {
    if (!tripId) {
      return null;
    }

    const normalized = tripId.trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') {
      return null;
    }

    return normalized;
  }

  private assertUserScope(ownerUserId: string | null): asserts ownerUserId is string {
    if (!ownerUserId) {
      throw new ServiceUnavailableException('No user context available');
    }
  }

  private getFallbackReminders(ownerUserId: string): Reminder[] {
    const existing = this.fallbackReminders.get(ownerUserId);
    if (existing) {
      return existing;
    }

    this.fallbackReminders.set(ownerUserId, []);
    return this.fallbackReminders.get(ownerUserId) || [];
  }
}
