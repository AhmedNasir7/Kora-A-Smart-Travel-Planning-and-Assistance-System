import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreatePackingItemDto } from './dtos/create-packing-item.dto';
import {
  PackingCategory,
  PackingCategorySummary,
  PackingItem,
  PackingOverviewResponse,
} from './packing.types';

interface PackingTripState {
  categories: PackingCategorySummary[];
  items: PackingItem[];
  selectedCategory: PackingCategory;
}

@Injectable()
export class PackingService {
  private readonly categoryTemplate: PackingCategorySummary[] = [
    { name: 'Clothing', icon: 'clothing', packed: 0, total: 0 },
    { name: 'Electronics', icon: 'electronics', packed: 0, total: 0 },
    { name: 'Health', icon: 'health', packed: 0, total: 0 },
    { name: 'Essentials', icon: 'essentials', packed: 0, total: 0 },
  ];

  private readonly itemTemplate: PackingItem[] = [];

  private readonly tripStates = new Map<string, PackingTripState>();

  getOverview(
    category?: PackingCategory,
    tripId?: string,
    requestUserId?: string,
  ): PackingOverviewResponse {
    this.assertUserScope(requestUserId);
    const state = this.getTripState(tripId, requestUserId);
    this.recalculateAllCategories(state);
    const selected = category || state.selectedCategory;
    state.selectedCategory = selected;

    return {
      trip: {
        title: 'Never forget a thing.',
        subtitle: tripId ? `Trip ${tripId}` : 'Plan ahead and keep every item in order.',
      },
      progress: this.calculateProgress(state.items),
      categories: state.categories,
      selectedCategory: selected,
      items: state.items.filter((item) => item.category === selected),
    };
  }

  addItem(
    dto: CreatePackingItemDto,
    requestUserId?: string,
  ): PackingOverviewResponse {
    this.assertUserScope(requestUserId);
    const state = this.getTripState(dto.tripId, requestUserId);
    const newItem: PackingItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name: dto.name,
      category: dto.category,
      packed: false,
    };

    state.items = [...state.items, newItem];
    this.recalculateCategory(state, dto.category);

    return this.getOverview(dto.category, dto.tripId, requestUserId);
  }

  toggleItem(
    id: string,
    tripId?: string,
    requestUserId?: string,
  ): PackingOverviewResponse {
    this.assertUserScope(requestUserId);
    const state = this.getTripState(tripId, requestUserId);
    const existing = state.items.find((item) => item.id === id);
    if (!existing) {
      throw new NotFoundException('Packing item not found');
    }

    state.items = state.items.map((item) =>
      item.id === id ? { ...item, packed: !item.packed } : item,
    );

    this.recalculateCategory(state, existing.category);
    return this.getOverview(existing.category, tripId, requestUserId);
  }

  deleteItem(
    id: string,
    tripId?: string,
    requestUserId?: string,
  ): PackingOverviewResponse {
    this.assertUserScope(requestUserId);
    const state = this.getTripState(tripId, requestUserId);
    const existing = state.items.find((item) => item.id === id);
    if (!existing) {
      throw new NotFoundException('Packing item not found');
    }

    state.items = state.items.filter((item) => item.id !== id);
    this.recalculateCategory(state, existing.category);
    return this.getOverview(existing.category, tripId, requestUserId);
  }

  private getTripState(
    tripId?: string,
    requestUserId?: string,
  ): PackingTripState {
    const normalizedUserId = this.normalizeScopeValue(requestUserId) || 'missing-user-scope';
    const normalizedTripId = this.normalizeScopeValue(tripId) || 'default';
    const key = `${normalizedUserId}:${normalizedTripId}`;
    const existing = this.tripStates.get(key);
    if (existing) {
      return existing;
    }

    const state: PackingTripState = {
      categories: this.categoryTemplate.map((category) => ({ ...category })),
      items: this.itemTemplate.map((item) => ({ ...item })),
      selectedCategory: 'Clothing',
    };

    this.tripStates.set(key, state);
    return state;
  }

  private normalizeScopeValue(value?: string): string | null {
    if (!value) {
      return null;
    }

    const normalized = value.trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') {
      return null;
    }

    return normalized;
  }

  private assertUserScope(requestUserId?: string): void {
    if (!this.normalizeScopeValue(requestUserId)) {
      throw new ServiceUnavailableException(
        'Unable to resolve user context for packing data. Sign in again to continue.',
      );
    }
  }

  private recalculateCategory(state: PackingTripState, category: PackingCategory): void {
    const total = state.items.filter((item) => item.category === category).length;
    const packed = state.items.filter(
      (item) => item.category === category && item.packed,
    ).length;

    const summary = state.categories.find((entry) => entry.name === category);
    if (summary) {
      summary.total = total;
      summary.packed = packed;
    }
  }

  private recalculateAllCategories(state: PackingTripState): void {
    for (const category of state.categories) {
      this.recalculateCategory(state, category.name);
    }
  }

  private calculateProgress(items: PackingItem[]): number {
    if (items.length === 0) {
      return 0;
    }

    const packedCount = items.filter((item) => item.packed).length;
    return Math.round((packedCount / items.length) * 100);
  }
}
