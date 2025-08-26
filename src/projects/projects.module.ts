import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Client } from '../clients/client.entity';
import { Project } from './entities/project.entity';
import { ProjectSeed } from './project.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Client])],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectSeed],
  exports: [ProjectsService, ProjectSeed],
})
export class ProjectsModule {}
