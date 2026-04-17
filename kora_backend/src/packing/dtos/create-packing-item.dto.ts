import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { PackingCategory } from '../packing.types';

const PACKING_CATEGORIES: PackingCategory[] = [
  'Clothing',
  'Electronics',
  'Health',
  'Essentials',
];

export class CreatePackingItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsIn(PACKING_CATEGORIES)
  category: PackingCategory;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  tripId?: string;
}
