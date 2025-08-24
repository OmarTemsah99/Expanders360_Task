import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsIn,
  IsOptional,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  country: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  services_needed: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget: number;

  @IsOptional()
  @IsIn(['active', 'completed', 'paused'])
  status?: 'active' | 'completed' | 'paused';

  // Admin-only path may allow passing clientId explicitly
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  clientId?: number;
}
