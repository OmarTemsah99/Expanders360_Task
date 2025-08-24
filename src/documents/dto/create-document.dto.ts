import { IsString, IsArray, IsOptional, IsUUID } from 'class-validator';

export class CreateDocumentDto {
  // We're updating the validator to IsUUID()
  @IsUUID()
  projectId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
