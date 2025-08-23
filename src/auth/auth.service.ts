import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
  ) {}

  async register(
    email: string,
    company_name: string,
    password: string,
    adminKey?: string,
  ) {
    const exists = await this.clients.findOne({
      where: { contact_email: email },
    });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);

    const role =
      adminKey && adminKey === this.config.get<string>('ADMIN_KEY')
        ? 'admin'
        : 'client';

    const user = this.clients.create({
      contact_email: email,
      company_name,
      password: hashed,
      role,
    });

    const saved = await this.clients.save(user);

    return {
      id: saved.id,
      company_name: saved.company_name,
      contact_email: saved.contact_email,
      role: saved.role,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.clients.findOne({
      where: { contact_email: email },
    });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    return ok ? user : null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      role: user.role,
      email: user.contact_email,
    };
    const token = await this.jwt.signAsync(payload);
    return { access_token: token };
  }
}
