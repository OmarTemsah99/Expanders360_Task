import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Client } from '../clients/client.entity';
import { Project } from './entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Client])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
