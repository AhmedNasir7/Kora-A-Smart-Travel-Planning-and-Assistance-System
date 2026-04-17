import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTripDto {
  @IsString()
  @MinLength(2)
  destination!: string;

  @IsOptional()
  @IsString()
  dates?: string;

  @IsOptional()
  @IsString()
  startDate!: string;

  @IsOptional()
  @IsString()
  endDate!: string;

  @IsIn(['Draft', 'Idea', 'Planning', 'Upcoming'])
  status!: 'Draft' | 'Idea' | 'Planning' | 'Upcoming';

  @IsOptional()
  @IsString()
  emoji?: string;
}
