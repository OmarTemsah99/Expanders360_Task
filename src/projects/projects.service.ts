import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

type Role = 'client' | 'admin';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
  ) {}

  async findAllForUser(userId: number, role: Role): Promise<Project[]> {
    if (role === 'admin') {
      return this.projects.find();
    }
    return this.projects.find({ where: { client: { id: userId } } });
  }

  async findOneForUser(
    id: string,
    userId: number,
    role: Role,
  ): Promise<Project> {
    const project = await this.projects.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (role !== 'admin' && project.client.id !== userId) {
      throw new ForbiddenException('You do not own this project');
    }
    return project;
  }

  async create(
    dto: CreateProjectDto,
    userId: number,
    role: Role,
  ): Promise<Project> {
    // TypeORM's findOne returns `Client | null` so accept null here.
    let client: Client | null = null;

    if (role === 'admin' && dto.clientId) {
      client = await this.clients.findOne({ where: { id: dto.clientId } });
      if (!client) throw new NotFoundException('Client not found');
    } else {
      client = await this.clients.findOne({ where: { id: userId } });
    }

    if (!client) throw new NotFoundException('Client not found');

    const project = this.projects.create({
      client,
      country: dto.country,
      services_needed: dto.services_needed,
      budget: dto.budget,
      status: dto.status ?? 'active',
    });

    return this.projects.save(project);
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    userId: number,
    role: Role,
  ): Promise<Project> {
    const project = await this.findOneForUser(id, userId, role);

    // Narrow values and cast after checking for undefined so assignments
    // satisfy strict TypeScript checks.
    if (dto.country !== undefined) project.country = dto.country as string;
    if (dto.services_needed !== undefined)
      project.services_needed = dto.services_needed as string[];
    if (dto.budget !== undefined) project.budget = dto.budget as number;
    if (dto.status !== undefined)
      project.status = dto.status as 'active' | 'completed' | 'paused';

    return this.projects.save(project);
  }

  async remove(
    id: string,
    userId: number,
    role: Role,
  ): Promise<{ deleted: true }> {
    const project = await this.findOneForUser(id, userId, role);
    await this.projects.remove(project);
    return { deleted: true };
  }
}
