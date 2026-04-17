import { IsOptional, IsString, IsUrl, MinLength, IsUUID, IsDateString, IsNumber } from 'class-validator';

export class CreateDocumentDto {
  @IsOptional()
  @IsUUID()
  tripId?: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  fileName!: string;

  @IsUrl()
  fileUrl!: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
