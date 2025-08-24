import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { Document, DocumentDocument } from './schemas/document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';

// Shape returned to clients: same fields as Document but with _id as string
export interface DocumentResponse extends Record<string, unknown> {
  _id: string;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
  ) {}

  /**
   * Creates a new document in the MongoDB collection.
   * @param createDocumentDto The data transfer object containing document details.
   * @returns The newly created document.
   */
  async create(
    createDocumentDto: CreateDocumentDto,
  ): Promise<DocumentResponse> {
    const createdDocument = new this.documentModel(createDocumentDto);
    const saved = await createdDocument.save();

    const obj = saved.toObject();
    // _id may be an ObjectId — normalize to string
    const rawId = (obj as { _id?: unknown })._id;
    let id: string;
    if (rawId == null) {
      id = '';
    } else if (typeof rawId === 'string') {
      id = rawId;
    } else if (typeof rawId === 'number') {
      id = String(rawId);
    } else if (rawId instanceof Types.ObjectId) {
      id = rawId.toHexString();
    } else {
      id = '';
    }

    return {
      ...(obj as unknown as DocumentResponse),
      _id: id,
    } as DocumentResponse;
  }

  /**
   * Finds documents based on a search query and/or tags.
   * @param query The search term for document content and title.
   * @param tags An array of tags to filter by.
   * @returns An array of matching documents.
   */
  async findByQuery(
    query?: string,
    tags?: string[],
  ): Promise<DocumentResponse[]> {
    const filter: FilterQuery<DocumentDocument> = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ];
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    const documents = await this.documentModel.find(filter).lean().exec();

    // Convert _id to string for each document
    return documents.map((doc) => {
      const rawId = (doc as { _id?: unknown })._id;
      let id: string;
      if (rawId == null) {
        id = '';
      } else if (typeof rawId === 'string') {
        id = rawId;
      } else if (typeof rawId === 'number') {
        id = String(rawId);
      } else if (rawId instanceof Types.ObjectId) {
        id = rawId.toHexString();
      } else {
        id = '';
      }
      return {
        ...(doc as unknown as DocumentResponse),
        _id: id,
      } as DocumentResponse;
    });
  }

  /**
   * Finds all documents associated with a specific project ID.
   * @param projectId The ID of the project.
   * @returns An array of documents linked to the project.
   */
  async findByProjectId(projectId: string): Promise<DocumentResponse[]> {
    const documents = await this.documentModel
      .find({ projectId })
      .lean()
      .exec();

    // Convert _id to string for each document
    return documents.map((doc) => {
      const rawId = (doc as { _id?: unknown })._id;
      let id: string;
      if (rawId == null) {
        id = '';
      } else if (typeof rawId === 'string') {
        id = rawId;
      } else if (typeof rawId === 'number') {
        id = String(rawId);
      } else if (rawId instanceof Types.ObjectId) {
        id = rawId.toHexString();
      } else {
        id = '';
      }
      return {
        ...(doc as unknown as DocumentResponse),
        _id: id,
      } as DocumentResponse;
    });
  }
}
