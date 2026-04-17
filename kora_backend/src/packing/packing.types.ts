export type PackingCategory =
  | 'Clothing'
  | 'Electronics'
  | 'Health'
  | 'Essentials';

export interface PackingItem {
  id: string;
  name: string;
  category: PackingCategory;
  packed: boolean;
}

export interface PackingCategorySummary {
  name: PackingCategory;
  icon: 'clothing' | 'electronics' | 'health' | 'essentials';
  packed: number;
  total: number;
}

export interface PackingOverviewResponse {
  trip: {
    title: string;
    subtitle: string;
  };
  progress: number;
  categories: PackingCategorySummary[];
  selectedCategory: PackingCategory;
  items: PackingItem[];
}
