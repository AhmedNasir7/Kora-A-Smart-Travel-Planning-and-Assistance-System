import {
  BadRequestException,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(RemindersService.name);
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

  async sendEmailNotification(
    payload: {
      type: 'trip_reminder' | 'custom_reminder';
      user_id: string;
      user_email: string;
      title: string;
      message: string;
      reminder_id?: string;
      trip_id?: string;
    },
    requestUserId?: string,
  ): Promise<{ success: boolean; message: string }> {
    const ownerUserId = this.resolveRequestUserId(requestUserId);
    this.assertUserScope(ownerUserId);

    // Validate payload
    if (
      !payload.type ||
      !payload.user_id ||
      !payload.user_email ||
      !payload.title ||
      !payload.message
    ) {
      throw new BadRequestException(
        'Missing required fields: type, user_id, user_email, title, message',
      );
    }

    // Verify user_id matches request user
    if (payload.user_id !== ownerUserId) {
      throw new BadRequestException(
        'user_id in payload must match authenticated user',
      );
    }

    try {
      const resendApiKey =
        this.configService.get<string>('RESEND_API_KEY') || '';
      const fromEmail =
        this.configService.get<string>('RESEND_FROM_EMAIL') ||
        'onboarding@resend.dev';

      if (!resendApiKey) {
        throw new ServiceUnavailableException(
          'RESEND_API_KEY is not configured on the backend',
        );
      }

      const subject = `Kora: ${payload.title}`;
      const html = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; background:#13151A; color:#E9EDF7; padding:24px;">
            <div style="max-width:600px;margin:0 auto;background:#1A1D26;border-radius:16px;overflow:hidden;border:1px solid #253047;">
              <div style="padding:24px;background:linear-gradient(135deg,#FF7B54,#FFB49F);color:#fff;">
                <h1 style="margin:0;font-size:24px;">${payload.type === 'trip_reminder' ? 'Trip Reminder' : 'Reminder'}</h1>
              </div>
              <div style="padding:24px;">
                <p style="margin-top:0;">Hi there,</p>
                <h2 style="margin:0 0 16px 0;color:#fff;">${payload.title}</h2>
                <div style="padding:16px;border-left:4px solid #FF7B54;background:#13151A;border-radius:8px;">
                  <p style="margin:0;line-height:1.6;">${payload.message}</p>
                </div>
                <p style="margin-top:20px;line-height:1.6;color:#B5BCCB;">Open Kora to review your trip or update your reminder.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: payload.user_email,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new ServiceUnavailableException(
          `Email service error: ${error}`,
        );
      }

      const result = await response.json();

      if (this.supabase && payload.reminder_id) {
        try {
          await this.supabase.from('notification_logs').insert({
            reminder_id: payload.reminder_id,
            trip_id: payload.trip_id,
            user_id: payload.user_id,
            type: payload.type,
            channel: 'email',
            sent_at: new Date().toISOString(),
            recipient_email: payload.user_email,
            status: 'sent',
          });
        } catch {
          // Logging failure should not block the notification.
        }
      }

      return {
        success: true,
        message: result.message || 'Email sent successfully',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      throw new ServiceUnavailableException(
        error instanceof Error ? error.message : 'Failed to send email',
      );
    }
  }

    async processDueReminderEmails(): Promise<{
      checked: number;
      sent: number;
      skipped: number;
    }> {
      if (!this.supabase) {
        this.logger.warn('Supabase not configured, skipping reminder email processing');
        return { checked: 0, sent: 0, skipped: 0 };
      }

      const now = new Date().toISOString();
      const { data: dueReminders, error } = await this.supabase
        .from('reminders')
        .select('*')
        .eq('is_completed', false)
        .lte('due_date', now)
        .order('due_date', { ascending: true });

      if (error) {
        this.logger.error(`Failed to fetch due reminders: ${error.message}`);
        throw new ServiceUnavailableException(error.message);
      }

      const reminders = (dueReminders || []) as Reminder[];
      this.logger.log(`Found ${reminders.length} due reminders to process`);
      let sent = 0;
      let skipped = 0;

      for (const reminder of reminders) {
        const alreadySent = await this.hasSentReminderEmail(reminder.id);
        if (alreadySent) {
          this.logger.debug(`Reminder ${reminder.id} email already sent, skipping`);
          skipped += 1;
          continue;
        }

        const recipientEmail = await this.getUserEmailById(reminder.user_id);
        if (!recipientEmail) {
          this.logger.warn(`Could not find email for user ${reminder.user_id}, skipping reminder ${reminder.id}`);
          skipped += 1;
          continue;
        }

        try {
          this.logger.log(`Sending reminder email to ${recipientEmail} for reminder ${reminder.id}`);
          await this.sendEmailNotification(
            {
              type: 'custom_reminder',
              user_id: reminder.user_id,
              user_email: recipientEmail,
              title: reminder.title,
              message: reminder.description
                ? `${reminder.title} - ${reminder.description} is due now.`
                : `${reminder.title} is due now.`,
              reminder_id: reminder.id,
              trip_id: reminder.trip_id,
            },
            reminder.user_id,
          );
          sent += 1;
          this.logger.log(`Successfully sent reminder email for reminder ${reminder.id}`);
        } catch (error) {
          this.logger.error(`Failed to send reminder email for reminder ${reminder.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          skipped += 1;
        }
      }

      this.logger.log(`Reminder email sweep complete: checked=${reminders.length}, sent=${sent}, skipped=${skipped}`);
      return {
        checked: reminders.length,
        sent,
        skipped,
      };
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

  private async hasSentReminderEmail(reminderId: string): Promise<boolean> {
    const { data, error } = await this.supabase!
      .from('notification_logs')
      .select('id')
      .eq('reminder_id', reminderId)
      .eq('channel', 'email')
      .limit(1);

    if (error) {
      return false;
    }

    return Boolean(data && data.length > 0);
  }

  private async getUserEmailById(userId: string): Promise<string | null> {
    if (!this.supabase) {
      this.logger.warn('Supabase not configured, cannot retrieve user email');
      return null;
    }

    // Method 1: Try Supabase Auth Admin API
    try {
      this.logger.debug(`Attempting to fetch user email via auth admin API for user ${userId}`);
      const { data, error } = await this.supabase.auth.admin.getUserById(userId);

      if (error) {
        this.logger.warn(`Auth admin API error for user ${userId}: ${error.message}`);
      } else if (data?.user?.email) {
        this.logger.debug(`Found user email via auth admin API: ${data.user.email}`);
        return data.user.email;
      } else {
        this.logger.warn(`Auth admin API returned no email for user ${userId}`);
      }
    } catch (err) {
      this.logger.warn(`Auth admin API exception for user ${userId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Method 2: Try querying from profiles table (fallback)
    try {
      this.logger.debug(`Attempting to fetch user email from profiles table for user ${userId}`);
      const { data, error } = await this.supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (error) {
        this.logger.debug(`Profiles table query error for user ${userId}: ${error.message}`);
      } else if (data?.email) {
        this.logger.log(`Found user email from profiles table: ${data.email}`);
        return data.email;
      }
    } catch (err) {
      this.logger.debug(`Profiles table query exception for user ${userId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Method 3: Try querying from users table (fallback)
    try {
      this.logger.debug(`Attempting to fetch user email from users table for user ${userId}`);
      const { data, error } = await this.supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (error) {
        this.logger.debug(`Users table query error for user ${userId}: ${error.message}`);
      } else if (data?.email) {
        this.logger.log(`Found user email from users table: ${data.email}`);
        return data.email;
      }
    } catch (err) {
      this.logger.debug(`Users table query exception for user ${userId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    this.logger.error(`Could not find email for user ${userId} via any method`);
    return null;
  }
}
