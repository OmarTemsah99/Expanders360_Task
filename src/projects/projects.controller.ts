import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';

interface Me {
  userId: number;
  role: 'client' | 'admin';
  email: string;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async list(@CurrentUser() me: Me) {
    return this.projectsService.findAllForUser(me.userId, me.role);
  }

  // The 'id' parameter is now a UUID string, so we remove ParseIntPipe.
  @Get(':id')
  async get(@Param('id') id: string, @CurrentUser() me: Me) {
    return this.projectsService.findOneForUser(id, me.userId, me.role);
  }

  @Post()
  async create(@Body() dto: CreateProjectDto, @CurrentUser() me: Me) {
    return this.projectsService.create(dto, me.userId, me.role);
  }

  // The 'id' parameter is now a UUID string, so we remove ParseIntPipe.
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() me: Me,
  ) {
    return this.projectsService.update(id, dto, me.userId, me.role);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() me: Me) {
    // Only admins can delete in this example
    return this.projectsService.remove(id, me.userId, me.role);
  }
}
