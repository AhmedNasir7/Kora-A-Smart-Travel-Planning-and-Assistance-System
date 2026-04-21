import { IsOptional, IsString, MinLength, IsUUID, IsDateString, IsNumber } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional()
  @IsUUID()
  tripId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  fileName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  fileUrl?: string;

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
