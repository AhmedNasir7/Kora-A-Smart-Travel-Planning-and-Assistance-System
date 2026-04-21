import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { UpdateDocumentDto } from './dtos/update-document.dto';
import {
  DocumentItem,
  DocumentListResponse,
  DocumentRecord,
  DocumentStatus,
} from './documents.types';

@Injectable()
export class DocumentsService {
  private readonly supabase: SupabaseClient | null;
  private readonly configErrorMessage: string | null;
  private readonly defaultUserId: string | null;
  private ownerUserId: string | null = null;
  private ownerUserIdPromise: Promise<string | null> | null = null;
  private fallbackDocuments: DocumentRecord[] = [
    
  ];

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
    this.defaultUserId =
      this.configService.get<string>('KORA_DEFAULT_USER_ID') || null;

    if (!supabaseUrl || !supabaseKey) {
      this.supabase = null;
      this.configErrorMessage =
        'Invalid Supabase configuration. Set SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in backend .env.';
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.configErrorMessage = null;
  }

  async listDocuments(
    filter: 'all' | DocumentStatus = 'all',
    tripId?: string,
    requestUserId?: string,
  ): Promise<DocumentListResponse> {
    const normalizedTripId = this.normalizeOptionalTripId(tripId);
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    if (!this.supabase) {
      const records = this.fallbackDocuments.filter((record) => {
        const matchesOwner = ownerUserId ? record.user_id === ownerUserId : true;
        const matchesTrip = normalizedTripId ? record.trip_id === normalizedTripId : true;
        return matchesOwner && matchesTrip;
      });

      const items = records
        .map((record) => this.mapDocument(record))
        .filter((item) => filter === 'all' || item.status === filter);

      return {
        items,
        total: items.length,
        filter,
      };
    }

    let query = this.supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (ownerUserId) {
      query = query.eq('user_id', ownerUserId);
    }
    if (normalizedTripId) {
      query = query.eq('trip_id', normalizedTripId);
    }

    const { data, error } = await query;
    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    const records = (data || []) as DocumentRecord[];
    const items = records
      .map((record) => this.mapDocument(record))
      .filter((item) => filter === 'all' || item.status === filter);

    return {
      items,
      total: items.length,
      filter,
    };
  }

  async createDocument(
    createDto: CreateDocumentDto,
    requestUserId?: string,
  ): Promise<DocumentItem> {
    const normalizedTripId = this.normalizeOptionalTripId(createDto.tripId);
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    if (!ownerUserId) {
      throw new ServiceUnavailableException(
        'No default user found. Set KORA_DEFAULT_USER_ID or create a profile row.',
      );
    }

    if (!this.supabase) {
      const now = new Date().toISOString();
      const fallbackRecord: DocumentRecord = {
        id: String(this.fallbackDocuments.length + 1),
        trip_id: normalizedTripId,
        user_id: ownerUserId,
        title: createDto.title,
        file_name: createDto.fileName || createDto.title,
        file_url: createDto.fileUrl?.trim() || '',
        file_type: createDto.fileType || null,
        file_size: createDto.fileSize || null,
        expiry_date: createDto.expiryDate || null,
        created_at: now,
        updated_at: now,
      };
      this.fallbackDocuments = [fallbackRecord, ...this.fallbackDocuments];
      return this.mapDocument(fallbackRecord);
    }

    const { data, error } = await this.supabase
      .from('documents')
      .insert({
        trip_id: normalizedTripId,
        user_id: ownerUserId,
        title: createDto.title,
        file_name: createDto.fileName || createDto.title,
        file_url: createDto.fileUrl?.trim() || '',
        file_type: createDto.fileType || null,
        file_size: createDto.fileSize || null,
        expiry_date: createDto.expiryDate || null,
      })
      .select('*')
      .single();

    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    return this.mapDocument(data as DocumentRecord);
  }

  async updateDocument(
    id: string,
    updateDto: UpdateDocumentDto,
    requestUserId?: string,
  ): Promise<DocumentItem> {
    const normalizedTripId = this.normalizeOptionalTripId(updateDto.tripId);
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);
    if (!this.supabase) {
      const existing = this.fallbackDocuments.find((item) => item.id === id);
      if (!existing) {
        throw new NotFoundException('Document not found or update failed');
      }

      if (ownerUserId && existing.user_id !== ownerUserId) {
        throw new NotFoundException('Document not found or update failed');
      }

      const updated: DocumentRecord = {
        ...existing,
        trip_id: normalizedTripId ?? existing.trip_id,
        title: updateDto.title ?? existing.title,
        file_name: updateDto.fileName ?? existing.file_name,
        file_url: updateDto.fileUrl !== undefined ? updateDto.fileUrl.trim() : existing.file_url,
        file_type: updateDto.fileType ?? existing.file_type,
        file_size: updateDto.fileSize ?? existing.file_size,
        expiry_date: updateDto.expiryDate ?? existing.expiry_date,
        updated_at: new Date().toISOString(),
      };

      this.fallbackDocuments = this.fallbackDocuments.map((doc) =>
        doc.id === id ? updated : doc,
      );

      return this.mapDocument(updated);
    }

    const updates: Record<string, unknown> = {};
    if (updateDto.tripId !== undefined) {
      updates.trip_id = normalizedTripId;
    }
    if (updateDto.title !== undefined) {
      updates.title = updateDto.title;
    }
    if (updateDto.fileName !== undefined) {
      updates.file_name = updateDto.fileName;
    }
    if (updateDto.fileUrl !== undefined) {
      updates.file_url = updateDto.fileUrl.trim();
    }
    if (updateDto.fileType !== undefined) {
      updates.file_type = updateDto.fileType;
    }
    if (updateDto.fileSize !== undefined) {
      updates.file_size = updateDto.fileSize;
    }
    if (updateDto.expiryDate !== undefined) {
      updates.expiry_date = updateDto.expiryDate;
    }

    let query = this.supabase.from('documents').update(updates).eq('id', id);

    if (ownerUserId) {
      query = query.eq('user_id', ownerUserId);
    }

    const { data, error } = await query.select('*').single();

    if (error) {
      throw new NotFoundException('Document not found or update failed');
    }

    return this.mapDocument(data as DocumentRecord);
  }

  async deleteDocument(
    id: string,
    requestUserId?: string,
  ): Promise<{ success: true }> {
    const ownerUserId = await this.resolveRequestOwnerUserId(requestUserId);
    this.assertUserScope(ownerUserId);

    if (!this.supabase) {
      const beforeCount = this.fallbackDocuments.length;
      this.fallbackDocuments = this.fallbackDocuments.filter((doc) => {
        const matchesId = doc.id === id;
        const matchesOwner = ownerUserId ? doc.user_id === ownerUserId : true;
        return !(matchesId && matchesOwner);
      });

      if (this.fallbackDocuments.length === beforeCount) {
        throw new NotFoundException('Document not found or delete failed');
      }

      return { success: true };
    }

    let query = this.supabase.from('documents').delete().eq('id', id);
    if (ownerUserId) {
      query = query.eq('user_id', ownerUserId);
    }

    const { error } = await query;
    if (error) {
      throw new NotFoundException('Document not found or delete failed');
    }

    return { success: true };
  }

  private mapDocument(record: DocumentRecord): DocumentItem {
    return {
      id: record.id,
      name: record.title,
      category: this.documentCategory(record),
      status: this.documentStatus(record.file_url, record.expiry_date),
      expiryDate: record.expiry_date || '',
      uploadDate: record.created_at,
      tripId: record.trip_id,
    };
  }

  private documentCategory(record: DocumentRecord): string {
    if (record.file_type) {
      const type = record.file_type.trim().toLowerCase();
      if (type === 'id' || type === 'identity') return 'ID';
      if (type.includes('ticket') || type.includes('flight') || type.includes('train')) {
        return 'Ticket';
      }
      if (
        type.includes('booking') ||
        type.includes('hotel') ||
        type.includes('reservation') ||
        type.includes('accommodation')
      ) {
        return 'Booking';
      }
      if (type.includes('insurance')) return 'Insurance';
      if (type.includes('visa')) return 'Visa';
      if (type.includes('health') || type.includes('vaccine') || type.includes('medical')) {
        return 'Health';
      }
    }

    const lowered = record.title.toLowerCase();
    if (
      lowered.includes('passport') ||
      lowered.includes('id') ||
      lowered.includes('license')
    ) {
      return 'ID';
    }
    if (lowered.includes('ticket') || lowered.includes('flight') || lowered.includes('train')) {
      return 'Ticket';
    }
    if (
      lowered.includes('booking') ||
      lowered.includes('hotel') ||
      lowered.includes('reservation')
    ) {
      return 'Booking';
    }
    if (lowered.includes('insurance')) return 'Insurance';
    if (lowered.includes('visa')) return 'Visa';
    if (
      lowered.includes('health') ||
      lowered.includes('vaccine') ||
      lowered.includes('medical')
    ) {
      return 'Health';
    }
    return 'Booking';
  }

  private documentStatus(fileUrl: string | null, expiryDate: string | null): DocumentStatus {
    if (!fileUrl) {
      return 'pending';
    }

    if (!expiryDate) {
      return 'verified';
    }

    const expiry = new Date(`${expiryDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return expiry < today ? 'expired' : 'verified';
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
    const normalized = this.normalizeRequestUserId(requestUserId);
    if (normalized) {
      return normalized;
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

  private assertUserScope(ownerUserId: string | null): void {
    if (!ownerUserId) {
      throw new ServiceUnavailableException(
        'Unable to resolve user context for document data. Sign in again or set KORA_DEFAULT_USER_ID.',
      );
    }
  }

  private async resolveOwnerUserId(): Promise<string | null> {
    if (this.defaultUserId) {
      return this.defaultUserId;
    }

    if (!this.supabase) {
      return '00000000-0000-0000-0000-000000000000';
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

    const { data: usersData, error: usersError } =
      await this.supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });

    if (usersError) {
      throw new ServiceUnavailableException(usersError.message);
    }

    return usersData.users[0]?.id || null;
  }
}
