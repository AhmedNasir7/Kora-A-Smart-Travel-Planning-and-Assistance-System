import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateTripDto } from './dtos/create-trip.dto';
import { UpdateTripStatusDto } from './dtos/update-trip-status.dto';
import {
  CreateTripRecordPayload,
  TripApiResponse,
  TripCardItem,
  TripDetail,
  TripDocument,
  TripPackingList,
  TripRecord,
  TripStatus,
  TripTimelineItem,
} from './trips.types';

type DatabaseRow = Record<string, unknown>;

@Injectable()
export class TripsService implements OnModuleInit {
  private readonly supabase: SupabaseClient | null;
  private readonly configErrorMessage: string | null;
  private readonly defaultUserId: string | null;
  private readonly hasServiceRoleKey: boolean;
  private ownerUserId: string | null = null;
  private ownerUserIdPromise: Promise<string | null> | null = null;
  private readonly fallbackTrips: TripRecord[] = [];
  private readonly fallbackTimelineByScope = new Map<string, TripTimelineItem[]>();

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const serviceRoleKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey =
      this.configService.get<string>('SUPABASE_ANON_KEY') ||
      this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
      '';

    this.hasServiceRoleKey = !!serviceRoleKey && !serviceRoleKey.includes('your-service-role-key') && !serviceRoleKey.includes('replace-with-your-service-role-key');
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

  async onModuleInit() {
    return;
  }

  async listTrips(
    status?: string,
    search?: string,
    requestUserId?: string,
  ): Promise<TripApiResponse> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);

    await this.purgeStartedTrips(ownerUserId);
    const rows = await this.fetchTripRows(ownerUserId);
    const normalizedStatus = status?.trim().toLowerCase();
    const normalizedSearch = search?.trim().toLowerCase();

    const filteredRows = rows.filter((row) => {
      const displayStatus = this.resolveDisplayStatus(row).toLowerCase();
      const matchesStatus =
        !normalizedStatus || normalizedStatus === 'all'
          ? true
          : displayStatus === normalizedStatus;

      const matchesSearch = !normalizedSearch
        ? true
        : `${row.destination} ${row.country || ''} ${row.title || ''}`
            .toLowerCase()
            .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });

    return {
      items: filteredRows.map((row) => this.mapCard(row)),
      total: filteredRows.length,
      tabs: ['all', 'upcoming', 'planning', 'draft', 'idea'],
    };
  }

  async getTrip(id: string, requestUserId?: string): Promise<TripDetail> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    const row = await this.fetchTripRow(id, ownerUserId);
    if (!row) {
      throw new NotFoundException('Trip not found');
    }

    return this.mapDetail(row);
  }

  async getTimeline(id: string, requestUserId?: string): Promise<TripTimelineItem[]> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    const tripRow = await this.fetchTripRow(id, ownerUserId);
    if (!tripRow) {
      throw new NotFoundException('Trip not found');
    }

    const rows = await this.fetchRelatedTableRows('timeline_events');
    const tripRows = this.filterRelatedRows(rows, id, ownerUserId);
    const timeline = tripRows
      .map((row) => this.mapTimelineItem(row))
      .filter(Boolean) as TripTimelineItem[];

    return timeline;
  }

  async addTimelineEvent(
    tripId: string,
    event: {
      title: string;
      description?: string;
      event_type: string;
      icon: string;
      start_time: string;
      end_time?: string;
      location?: string;
    },
    requestUserId?: string,
  ): Promise<TripTimelineItem> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    
    const tripRow = await this.fetchTripRow(tripId, ownerUserId);
    if (!tripRow) {
      throw new NotFoundException('Trip not found');
    }

    const timelineItem: TripTimelineItem = {
      id: this.generateId(),
      time: this.formatTimeLabel(event.start_time),
      title: event.title,
      icon: event.icon || this.iconForEventType(event.event_type),
    };

    if (!this.supabase) {
      const timeline = this.getFallbackTimeline(ownerUserId, tripId);
      timeline.unshift(timelineItem);
      this.fallbackTimelineByScope.set(this.timelineScopeKey(ownerUserId, tripId), timeline);
      return timelineItem;
    }

    const { data, error } = await this.supabase
      .from('timeline_events')
      .insert({
        trip_id: tripId,
        user_id: ownerUserId,
        title: event.title,
        description: event.description || null,
        event_type: event.event_type,
        icon: event.icon,
        start_time: event.start_time,
        end_time: event.end_time || null,
        location: event.location || null,
      })
      .select('*')
      .single();

    if (error || !data) {
      const timeline = this.getFallbackTimeline(ownerUserId, tripId);
      timeline.unshift(timelineItem);
      this.fallbackTimelineByScope.set(this.timelineScopeKey(ownerUserId, tripId), timeline);
      return timelineItem;
    }

    const mapped = this.mapTimelineItem(data as DatabaseRow);
    return mapped || timelineItem;
  }

  async updateTimelineEvent(
    tripId: string,
    eventId: string,
    updates: Partial<{
      title: string;
      description?: string;
      event_type: string;
      icon: string;
      start_time: string;
      end_time?: string;
      location?: string;
    }>,
    requestUserId?: string,
  ): Promise<TripTimelineItem> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    
    const tripRow = await this.fetchTripRow(tripId, ownerUserId);
    if (!tripRow) {
      throw new NotFoundException('Trip not found');
    }

    if (!this.supabase) {
      const timeline = this.getFallbackTimeline(ownerUserId, tripId);
      const existing = timeline.find((event) => event.id === eventId);
      if (!existing) {
        throw new NotFoundException('Timeline event not found');
      }

      const updated: TripTimelineItem = {
        ...existing,
        title: updates.title ?? existing.title,
        time: updates.start_time ? this.formatTimeLabel(updates.start_time) : existing.time,
        icon: updates.icon ?? existing.icon,
      };

      this.fallbackTimelineByScope.set(
        this.timelineScopeKey(ownerUserId, tripId),
        timeline.map((event) => (event.id === eventId ? updated : event)),
      );

      return updated;
    }

    const { data, error } = await this.supabase
      .from('timeline_events')
      .update({
        title: updates.title,
        description: updates.description,
        event_type: updates.event_type,
        icon: updates.icon,
        start_time: updates.start_time,
        end_time: updates.end_time,
        location: updates.location,
      })
      .eq('id', eventId)
      .eq('trip_id', tripId)
      .eq('user_id', ownerUserId)
      .select('*')
      .single();

    if (error || !data) {
      throw new NotFoundException('Timeline event not found or update failed');
    }

    const mapped = this.mapTimelineItem(data as DatabaseRow);
    if (!mapped) {
      throw new ServiceUnavailableException('Failed to map updated timeline event');
    }

    return mapped;
  }

  async deleteTimelineEvent(
    tripId: string,
    eventId: string,
    requestUserId?: string,
  ): Promise<{ success: true }> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    
    const tripRow = await this.fetchTripRow(tripId, ownerUserId);
    if (!tripRow) {
      throw new NotFoundException('Trip not found');
    }

    if (!this.supabase) {
      const timeline = this.getFallbackTimeline(ownerUserId, tripId);
      const nextTimeline = timeline.filter((event) => event.id !== eventId);
      if (nextTimeline.length === timeline.length) {
        throw new NotFoundException('Timeline event not found');
      }

      this.fallbackTimelineByScope.set(this.timelineScopeKey(ownerUserId, tripId), nextTimeline);
      return { success: true };
    }

    const { error } = await this.supabase
      .from('timeline_events')
      .delete()
      .eq('id', eventId)
      .eq('trip_id', tripId)
      .eq('user_id', ownerUserId);

    if (error) {
      throw new NotFoundException('Timeline event not found or delete failed');
    }

    return { success: true };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private timelineScopeKey(ownerUserId: string, tripId: string): string {
    return `${ownerUserId}:${tripId}`;
  }

  private getFallbackTimeline(ownerUserId: string, tripId: string): TripTimelineItem[] {
    return this.fallbackTimelineByScope.get(this.timelineScopeKey(ownerUserId, tripId)) || [];
  }

  private isValidTripDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.getTime());
  }

  async getPacking(id: string, requestUserId?: string): Promise<TripPackingList> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    const tripRow = await this.fetchTripRow(id, ownerUserId);
    if (!tripRow) {
      throw new NotFoundException('Trip not found');
    }

    const categoryRows = this.filterRelatedRows(
      await this.fetchRelatedTableRows('packing_categories'),
      id,
      ownerUserId,
    );
    const itemRows = this.filterRelatedRows(
      await this.fetchRelatedTableRows('packing_items'),
      id,
      ownerUserId,
    );

    const packing = this.buildPackingList(categoryRows, itemRows);
    return packing || this.defaultPacking();
  }

  async getDocuments(id: string, requestUserId?: string): Promise<TripDocument[]> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    const tripRow = await this.fetchTripRow(id, ownerUserId);
    if (!tripRow) {
      throw new NotFoundException('Trip not found');
    }

    const rows = this.filterRelatedRows(
      await this.fetchRelatedTableRows('documents'),
      id,
      ownerUserId,
    );
    const documents = rows
      .map((row) => this.mapDocument(row))
      .filter(Boolean) as TripDocument[];

    return documents;
  }

  async createTrip(
    createTripDto: CreateTripDto,
    requestUserId?: string,
  ): Promise<TripCardItem> {
    const { destination, emoji = '✈️' } = createTripDto;
    const { startDate, endDate } = this.extractTripDates(createTripDto);

    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    if (!this.isValidTripDate(startDate) || !this.isValidTripDate(endDate)) {
      throw new BadRequestException('Trip dates must be valid ISO dates (YYYY-MM-DD)');
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    if (startDate < todayIso) {
      throw new BadRequestException('Trip start date cannot be before today');
    }

    if (endDate < startDate) {
      throw new BadRequestException('Trip end date cannot be before start date');
    }

    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    if (!ownerUserId) {
      throw new ServiceUnavailableException(
        'No default Supabase user was found. Set KORA_DEFAULT_USER_ID or create a profile row for the intended owner.',
      );
    }

    const payload: CreateTripRecordPayload = {
      title: `${destination} Trip`,
      user_id: ownerUserId,
      destination,
      start_date: startDate,
      end_date: endDate,
      description: this.withProgressHint(
        this.withStatusHint(
          `${destination} trip created from the dashboard modal.`,
          createTripDto.status,
        ),
        0,
      ),
      cover_image: emoji,
    };

    const row = await this.insertTrip(payload, createTripDto.status);
    return this.mapCard(row);
  }

  async updateTripStatus(
    id: string,
    updateTripStatusDto: UpdateTripStatusDto,
    requestUserId?: string,
  ): Promise<TripCardItem> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    const existing = await this.fetchTripRow(id, ownerUserId);
    if (!existing) {
      throw new NotFoundException('Trip not found');
    }

    const nextDescription = this.withStatusHint(
      this.withoutStatusHint(existing.description || `${existing.destination} trip`),
      updateTripStatusDto.status,
    );

    if (!this.supabase) {
      const updated: TripRecord = {
        ...existing,
        status: updateTripStatusDto.status,
        description: nextDescription,
      };
      const rowIndex = this.fallbackTrips.findIndex((trip) => trip.id === id);
      if (rowIndex >= 0) {
        this.fallbackTrips[rowIndex] = updated;
      }
      return this.mapCard(updated);
    }

    let query = this.supabase
      .from('trips')
      .update({
        status: updateTripStatusDto.status,
        description: nextDescription,
      })
      .eq('id', id);

    if (ownerUserId) {
      query = query.eq('user_id', ownerUserId);
    }

    const { data, error } = await query.select('*').single();
    if (!error && data) {
      return this.mapCard(data as TripRecord);
    }

    const shouldRetryWithoutStatus = (error?.message || '').toLowerCase().includes('status');
    if (shouldRetryWithoutStatus) {
      let retryQuery = this.supabase
        .from('trips')
        .update({ description: nextDescription })
        .eq('id', id);

      if (ownerUserId) {
        retryQuery = retryQuery.eq('user_id', ownerUserId);
      }

      const { data: retryData, error: retryError } = await retryQuery.select('*').single();
      if (retryError || !retryData) {
        throw new NotFoundException('Trip not found or update failed');
      }

      const mergedRow = {
        ...(retryData as TripRecord),
        status: updateTripStatusDto.status,
        description: nextDescription,
      } as TripRecord;

      return this.mapCard(mergedRow);
    }

    throw new NotFoundException('Trip not found or update failed');
  }

  async deleteTrip(
    id: string,
    requestUserId?: string,
  ): Promise<{ success: true }> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    const existing = await this.fetchTripRow(id, ownerUserId);
    if (!existing) {
      throw new NotFoundException('Trip not found');
    }

    if (!this.supabase) {
      const before = this.fallbackTrips.length;
      this.fallbackTrips.splice(
        0,
        this.fallbackTrips.length,
        ...this.fallbackTrips.filter((trip) => trip.id !== id),
      );
      if (this.fallbackTrips.length === before) {
        throw new NotFoundException('Trip not found or delete failed');
      }
      return { success: true };
    }

    let query = this.supabase.from('trips').delete().eq('id', id);
    if (ownerUserId) {
      query = query.eq('user_id', ownerUserId);
    }

    const { error } = await query;
    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    return { success: true };
  }

  private async ensureSeedData(): Promise<void> {
    if (!this.supabase) {
      return;
    }

    const ownerUserId = await this.getOwnerUserId();
    if (!ownerUserId) {
      return;
    }

    const { count, error } = await this.supabase
      .from('trips')
      .select('id', { count: 'exact', head: true });

    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    if ((count || 0) > 0) {
      return;
    }

    const { error: insertError } = await this.supabase.from('trips').insert(
      this.fallbackTrips.map((trip) => ({
        title: `${trip.destination} Trip`,
        user_id: ownerUserId,
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
        description: this.withStatusHint(trip.description || '', trip.status),
        cover_image: trip.emoji,
      })),
    );

    if (insertError) {
      throw new ServiceUnavailableException(insertError.message);
    }
  }

  private async fetchTripRows(ownerUserId?: string | null): Promise<TripRecord[]> {
    if (!this.supabase) {
      return this.fallbackTrips.filter((trip) =>
        ownerUserId ? trip.user_id === ownerUserId : true,
      );
    }

    let query = this.supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (ownerUserId) {
      query = query.eq('user_id', ownerUserId);
    }

    const { data, error } = await query;

    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    return (data || []) as TripRecord[];
  }

  private async getOwnerUserId(): Promise<string | null> {
    if (this.ownerUserId) {
      return this.ownerUserId;
    }

    if (this.ownerUserIdPromise) {
      return this.ownerUserIdPromise;
    }

    this.ownerUserIdPromise = this.resolveOwnerUserId();
    this.ownerUserId = await this.ownerUserIdPromise;
    return this.ownerUserId;
  }

  private async resolveRequestOwnerUserId(requestUserId?: string): Promise<string | null> {
    const normalizedRequestUserId = this.normalizeRequestUserId(requestUserId);
    if (normalizedRequestUserId) {
      return normalizedRequestUserId;
    }

    return null;
  }

  private normalizeRequestUserId(requestUserId?: string): string | null {
    if (!requestUserId) {
      return null;
    }

    const normalized = requestUserId.trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') {
      return null;
    }

    return normalized;
  }

  private assertUserScope(ownerUserId: string | null): asserts ownerUserId is string {
    if (!ownerUserId) {
      throw new ServiceUnavailableException(
        'Unable to resolve user context for trip data. Sign in again or set KORA_DEFAULT_USER_ID.',
      );
    }
  }

  private async resolveOwnerUserId(): Promise<string | null> {
    if (this.defaultUserId) {
      return this.defaultUserId;
    }

    if (!this.supabase) {
      return null;
    }

    const { data: profileRows, error: profileError } = await this.supabase
      .from('profiles')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1);

    if (profileError) {
      throw new ServiceUnavailableException(profileError.message);
    }

    const profileId = profileRows?.[0]?.id ? String(profileRows[0].id) : '';
    if (profileId) {
      return profileId;
    }

    // Only attempt admin API if we have service role key
    if (!this.hasServiceRoleKey) {
      return null;
    }

    const { data: usersData, error: usersError } = await this.supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (usersError) {
      throw new ServiceUnavailableException(usersError.message);
    }

    return usersData.users[0]?.id || null;
  }

  private async fetchRelatedTableRows(tableName: string): Promise<DatabaseRow[]> {
    if (!this.supabase) {
      return [];
    }

    const { data, error } = await this.supabase.from(tableName).select('*');

    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    return (data || []) as DatabaseRow[];
  }

  private async fetchTripRow(
    id: string,
    ownerUserId?: string | null,
  ): Promise<TripRecord | null> {
    if (!this.supabase) {
      return (
        this.fallbackTrips.find(
          (trip) => trip.id === id && (ownerUserId ? trip.user_id === ownerUserId : true),
        ) || null
      );
    }

    let query = this.supabase.from('trips').select('*').eq('id', id);
    if (ownerUserId) {
      query = query.eq('user_id', ownerUserId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    return (data as TripRecord | null) ?? null;
  }

  private async purgeStartedTrips(ownerUserId?: string | null): Promise<void> {
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);

    if (!this.supabase) {
      this.fallbackTrips.splice(
        0,
        this.fallbackTrips.length,
        ...this.fallbackTrips.filter((trip) => {
          const matchesOwner = ownerUserId ? trip.user_id === ownerUserId : true;
          if (!matchesOwner) {
            return true;
          }

          return !this.hasStarted(trip.start_date, todayIso);
        }),
      );
      return;
    }

    let query = this.supabase
      .from('trips')
      .delete()
      .lte('start_date', todayIso);

    if (ownerUserId) {
      query = query.eq('user_id', ownerUserId);
    }

    const { error } = await query;
    if (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }

  private hasStarted(startDate: string, todayIso: string): boolean {
    if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return startDate <= todayIso;
    }

    const parsed = new Date(startDate);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }

    return parsed.toISOString().slice(0, 10) <= todayIso;
  }

  private async insertTrip(
    payload: CreateTripRecordPayload,
    fallbackStatus?: string,
  ): Promise<TripRecord> {
    if (!this.supabase) {
      const record: TripRecord = {
        id: String(this.fallbackTrips.length + 1),
        ...payload,
        status: fallbackStatus || 'Planning',
      };
      this.fallbackTrips.unshift(record);
      return record;
    }

    const { data, error } = await this.supabase
      .from('trips')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    return data as TripRecord;
  }

  private mapCard(row: TripRecord): TripCardItem {
    const normalizedStatus = this.resolveDisplayStatus(row);
    return {
      id: row.id,
      destination: row.destination,
      country: row.country || this.deriveCountry(row.destination),
      status: normalizedStatus,
      startDate: this.formatDateLabel(row.start_date),
      endDate: this.formatDateLabel(row.end_date),
      progress: this.resolveProgress(row, normalizedStatus),
      emoji: row.emoji || row.cover_image || '✈️',
    };
  }

  private mapDetail(row: TripRecord): TripDetail {
    const normalizedStatus = this.resolveDisplayStatus(row);
    return {
      id: row.id,
      destination: row.destination,
      country: row.country || this.deriveCountry(row.destination),
      status: normalizedStatus,
      startDate: this.formatDateLabel(row.start_date).toUpperCase(),
      endDate: this.formatDateLabel(row.end_date).toUpperCase(),
      progress: this.resolveProgress(row, normalizedStatus),
      description: this.withoutProgressHint(
        this.withoutStatusHint(row.description || `${row.destination} trip`),
      ),
      emoji: row.emoji || row.cover_image || '✈️',
      tasksRemaining:
        typeof row.tasks_remaining === 'number'
          ? row.tasks_remaining
          : this.estimateTasksRemaining(normalizedStatus),
    };
  }

  private filterRelatedRows(
    rows: DatabaseRow[],
    tripId: string,
    ownerUserId?: string | null,
  ): DatabaseRow[] {
    return rows.filter((row) => {
      const matchesTrip = this.matchesTripId(row, tripId);
      const matchesOwner = ownerUserId ? this.matchesUserId(row, ownerUserId) : true;
      return matchesTrip && matchesOwner;
    });
  }

  private matchesTripId(row: DatabaseRow, tripId: string): boolean {
    const directKeys = [
      'trip_id',
      'tripId',
      'trip',
      'related_trip_id',
      'parent_trip_id',
      'trip_uuid',
    ];

    return directKeys.some((key) => {
      const value = row[key];
      return value !== undefined && value !== null && String(value) === tripId;
    });
  }

  private matchesUserId(row: DatabaseRow, userId: string): boolean {
    const directKeys = ['user_id', 'userId', 'owner_id', 'ownerId'];

    return directKeys.some((key) => {
      const value = row[key];
      return value !== undefined && value !== null && String(value) === userId;
    });
  }

  private mapTimelineItem(row: DatabaseRow): TripTimelineItem | null {
    const id = this.toString(row, ['id', 'event_id', 'timeline_event_id']);
    const title = this.toString(row, ['title', 'name', 'description', 'label']);
    const startTime = this.toString(row, ['start_time']);
    const icon = this.toString(row, ['icon', 'emoji', 'type_icon']);

    if (!title) {
      return null;
    }

    return {
      id: id || `${title}-${startTime}`,
      time: this.formatTimeLabel(startTime),
      title,
      icon: icon || this.iconForEventType(this.toString(row, ['event_type'])),
    };
  }

  private mapDocument(row: DatabaseRow): TripDocument | null {
    const id = this.toString(row, ['id', 'document_id']);
    const name = this.toString(row, ['title', 'name', 'document_name']);
    if (!name) {
      return null;
    }

    return {
      id: id || name,
      name,
      status: this.toString(row, ['expiry_date']).length > 0 ? 'pending' : 'ready',
      type: this.toString(row, ['file_type', 'type', 'category', 'document_type']) || 'Travel',
    };
  }

  private buildPackingList(
    categoryRows: DatabaseRow[],
    itemRows: DatabaseRow[],
  ): TripPackingList | null {
    if (categoryRows.length === 0 && itemRows.length === 0) {
      return null;
    }

    const categories = categoryRows.map((row) => ({
      icon: this.toString(row, ['icon', 'emoji']) || '📦',
      name: this.toString(row, ['name', 'title', 'category']) || 'Packing',
      count: this.formatCategoryCount(row),
    }));

    const items = itemRows.map((row) => ({
      item: this.toString(row, ['name', 'item', 'title']) || 'Item',
      count: this.formatQuantity(row),
      checked: this.toBoolean(row, ['checked', 'is_checked', 'completed', 'is_packed']),
    }));

    return {
      title: categories[0]?.name || 'Packing',
      categories,
      featuredList: {
        title: categories[0]?.name || 'Packing',
        items,
      },
    };
  }

  private defaultPacking(): TripPackingList {
    return {
      title: 'Packing',
      categories: [],
      featuredList: { title: 'Packing', items: [] },
    };
  }

  private toString(row: DatabaseRow, keys: string[]): string {
    for (const key of keys) {
      const value = row[key];
      if (value !== undefined && value !== null && value !== '') {
        return String(value);
      }
    }

    return '';
  }

  private toBoolean(row: DatabaseRow, keys: string[]): boolean {
    for (const key of keys) {
      const value = row[key];
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          return value;
        }
        return ['true', '1', 'yes', 'done', 'completed'].includes(
          String(value).toLowerCase(),
        );
      }
    }

    return false;
  }

  private formatQuantity(row: DatabaseRow): string {
    const quantity = this.toString(row, ['quantity']);
    if (!quantity) {
      return '';
    }

    return `(${quantity}x)`;
  }

  private formatCategoryCount(row: DatabaseRow): string {
    const total = this.toString(row, ['count']);
    if (total) {
      return total;
    }

    return this.toString(row, ['sort_order']);
  }

  private formatTimeLabel(value: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date
        .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
        })
        .replace(/\s?(AM|PM)$/i, '');
    }

    return value;
  }

  private iconForEventType(eventType: string): string {
    const normalized = eventType.toLowerCase();
    if (normalized.includes('transport')) {
      return '✈️';
    }
    if (normalized.includes('stay')) {
      return '🏨';
    }
    if (normalized.includes('activity')) {
      return '📸';
    }

    return '•';
  }

  private formatDateLabel(value: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const date = new Date(`${value}T00:00:00`);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }
    }

    return value;
  }

  private deriveCountry(destination: string): string {
    const normalizedDestination = destination.trim().toLowerCase();
    const mapping: Record<string, string> = {
      tokyo: 'Japan',
      barcelona: 'Spain',
      'new york': 'USA',
      bali: 'Indonesia',
      paris: 'France',
      rome: 'Italy',
    };

    return mapping[normalizedDestination] || 'Unknown';
  }

  private extractTripDates(createTripDto: CreateTripDto): {
    startDate: string;
    endDate: string;
  } {
    const legacyDates = (createTripDto as CreateTripDto & { dates?: string }).dates;
    if (createTripDto.startDate && createTripDto.endDate) {
      return {
        startDate: createTripDto.startDate,
        endDate: createTripDto.endDate,
      };
    }

    if (legacyDates) {
      const [startDateRaw, endDateRaw] = legacyDates
        .split('-')
        .map((part) => part.trim())
        .filter(Boolean);

      return {
        startDate: startDateRaw || '',
        endDate: endDateRaw || '',
      };
    }

    return { startDate: '', endDate: '' };
  }

  private toDisplayStatus(status: string): TripStatus {
    const value = status.trim().toLowerCase();
    if (value === 'upcoming') {
      return 'Upcoming';
    }
    if (value === 'draft') {
      return 'Draft';
    }
    if (value === 'idea') {
      return 'Idea';
    }
    return 'Planning';
  }

  private resolveDisplayStatus(row: TripRecord): TripStatus {
    const hintedStatus = this.parseStatusHint(row.description);
    if (hintedStatus) {
      return hintedStatus;
    }

    const mappedStatus = this.toDisplayStatus(String(row.status || ''));
    if (mappedStatus !== 'Planning') {
      return mappedStatus;
    }

    return this.defaultStatusByDestination(row.destination);
  }

  private parseStatusHint(description?: string | null): TripStatus | null {
    if (!description) {
      return null;
    }

    const match = description.match(/\[status:(Upcoming|Planning|Draft|Idea)\]/i);
    if (!match?.[1]) {
      return null;
    }

    return this.toDisplayStatus(match[1]);
  }

  private withStatusHint(description: string, status: string): string {
    const cleanDescription = this.withoutStatusHint(description).trim();
    const normalizedStatus = this.toDisplayStatus(status);
    return `${cleanDescription} [status:${normalizedStatus}]`.trim();
  }

  private withProgressHint(description: string, progress: number): string {
    const cleanDescription = this.withoutProgressHint(description).trim();
    const normalizedProgress = Number.isFinite(progress) ? Math.max(0, progress) : 0;
    return `${cleanDescription} [progress:${normalizedProgress}]`.trim();
  }

  private withoutStatusHint(description: string): string {
    return description.replace(/\s*\[status:(Upcoming|Planning|Draft|Idea)\]/gi, '').trim();
  }

  private withoutProgressHint(description: string): string {
    return description.replace(/\s*\[progress:\d+\]/gi, '').trim();
  }

  private parseProgressHint(description?: string | null): number | null {
    if (!description) {
      return null;
    }

    const match = description.match(/\[progress:(\d+)\]/i);
    if (!match?.[1]) {
      return null;
    }

    const parsed = Number(match[1]);
    if (!Number.isFinite(parsed)) {
      return null;
    }

    return Math.max(0, parsed);
  }

  private defaultStatusByDestination(destination: string): TripStatus {
    const normalizedDestination = destination.trim().toLowerCase();
    if (normalizedDestination === 'tokyo') {
      return 'Upcoming';
    }
    if (normalizedDestination === 'new york' || normalizedDestination === 'bali') {
      return 'Draft';
    }
    if (normalizedDestination === 'paris') {
      return 'Idea';
    }
    return 'Planning';
  }

  private resolveProgress(row: TripRecord, status: TripStatus): number {
    if (typeof row.progress === 'number') {
      return row.progress;
    }

    const hintedProgress = this.parseProgressHint(row.description);
    if (hintedProgress !== null) {
      return hintedProgress;
    }

    if (status === 'Upcoming') {
      return 75;
    }
    if (status === 'Planning') {
      return 40;
    }
    if (status === 'Draft') {
      return 15;
    }
    return 0;
  }

  private estimateTasksRemaining(status: TripStatus): number {
    if (status === 'Upcoming') {
      return 8;
    }
    if (status === 'Planning') {
      return 12;
    }
    if (status === 'Draft') {
      return 15;
    }
    return 15;
  }
}
