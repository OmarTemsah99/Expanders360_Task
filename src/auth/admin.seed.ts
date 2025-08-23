import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Client } from '../clients/client.entity';

@Injectable()
export class AdminSeed {
  private readonly log = new Logger(AdminSeed.name);

  constructor(
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
  ) {}

  async run() {
    const email = process.env.ADMIN_EMAIL ?? 'admin@expander.io';
    const password = process.env.ADMIN_PASSWORD ?? 'Admin123!';
    const companyName = process.env.ADMIN_COMPANY ?? 'Admin';

    // Check if admin already exists
    const exists = await this.clients.findOne({
      where: { contact_email: email },
    });
    if (exists) {
      this.log.log(`Admin already exists: ${email}`);
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    await this.clients.save({
      company_name: companyName,
      contact_email: email,
      password: hashed,
      role: 'admin',
    });

    this.log.log(`Admin created: ${email}`);
  }
}
