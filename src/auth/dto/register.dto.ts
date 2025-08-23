import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  company_name: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  adminKey?: string;
}
