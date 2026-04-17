import { IsIn } from 'class-validator';

export class UpdateTripStatusDto {
  @IsIn(['Draft', 'Idea', 'Planning', 'Upcoming'])
  status!: 'Draft' | 'Idea' | 'Planning' | 'Upcoming';
}
