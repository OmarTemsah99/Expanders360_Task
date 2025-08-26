import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Client } from '../clients/client.entity';

@Injectable()
export class ProjectSeed {
  private readonly log = new Logger(ProjectSeed.name);

  constructor(
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
  ) {}

  async run() {
    // find the admin client (or fallback to first client in DB)
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@expander.io';
    const client = await this.clients.findOne({
      where: { contact_email: adminEmail },
    });

    if (!client) {
      this.log.error(
        `No client found for seeding projects. Did you run AdminSeed first?`,
      );
      return;
    }

    const seedProjects = [
      {
        country: 'Egypt',
        services_needed: ['market_research', 'legal_setup'],
        budget: 50000,
        status: 'active' as const,
      },
      {
        country: 'UAE',
        services_needed: ['company_registration', 'marketing'],
        budget: 75000,
        status: 'active' as const,
      },
      {
        country: 'KSA',
        services_needed: ['market_research'],
        budget: 30000,
        status: 'paused' as const,
      },
      {
        country: 'Germany',
        services_needed: ['legal_setup', 'hiring'],
        budget: 100000,
        status: 'active' as const,
      },
      {
        country: 'USA',
        services_needed: ['market_research', 'expansion_strategy'],
        budget: 150000,
        status: 'completed' as const,
      },
    ];

    for (const project of seedProjects) {
      const exists = await this.projects.findOne({
        where: {
          client: { id: client.id },
          country: project.country,
          status: project.status,
        },
      });

      if (exists) {
        this.log.log(
          `Project already exists for ${project.country} (${project.status})`,
        );
        continue;
      }

      await this.projects.save({
        ...project,
        client: { id: client.id },
      });

      this.log.log(
        `Project created for ${project.country} (${project.status})`,
      );
    }
  }
}
