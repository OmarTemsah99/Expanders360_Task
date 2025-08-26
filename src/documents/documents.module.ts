// src/documents/documents.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document, DocumentSchema } from './schemas/document.schema';
import { DocumentSeed } from './document.seed';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [
    // MongoDB configuration for documents
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
    // TypeORM configuration to access projects
    TypeOrmModule.forFeature([Project]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentSeed],
  exports: [DocumentsService, DocumentSeed],
})
export class DocumentsModule {}
