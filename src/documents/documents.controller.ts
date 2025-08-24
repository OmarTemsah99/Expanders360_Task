import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

// The @UseGuards() decorator applies the RolesGuard to all routes in this controller.
// Since AuthGuard is global, it runs first, then the RolesGuard checks for roles.
@Controller('documents')
@UseGuards(RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Endpoint to upload a new document.
   * This route is protected by both the global JWT guard and the RolesGuard.
   * We will check for the 'admin' role. You can customize this as needed.
   * Example: a 'vendor' could also be allowed to upload documents.
   */
  @Post()
  @Roles('admin') // Only users with the 'admin' role can create documents.
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  /**
   * Endpoint to query and search documents.
   * Handles a GET request to `/documents`.
   * This route is public and does not require authentication.
   */
  @Get()
  @Public() // This decorator bypasses the global JWT guard.
  async findByQuery(
    @Query('query') query?: string,
    @Query('tags') tags?: string,
  ) {
    const tagsArray = tags ? tags.split(',') : undefined;
    return this.documentsService.findByQuery(query, tagsArray);
  }

  /**
   * Endpoint to find documents by project ID.
   * This route is also public for general access.
   */
  @Get('project/:projectId')
  @Public() // This decorator bypasses the global JWT guard.
  async findByProjectId(@Param('projectId') projectId: string) {
    return this.documentsService.findByProjectId(projectId);
  }
}
