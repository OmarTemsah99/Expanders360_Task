// src/documents/documents.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document, DocumentSchema } from './schemas/document.schema';

@Module({
  imports: [
    // `MongooseModule.forFeature()` is used to configure which models are
    // available in the current module.
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
