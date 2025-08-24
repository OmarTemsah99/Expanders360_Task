import {
  IsArray,
  ArrayNotEmpty,
  IsInt,
  Min,
  IsNumber,
  IsString,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  countries_supported: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  services_offered: string[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  response_sla_hours: number;
}
