import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

// The `DocumentDocument` type provides a strongly typed representation
// of our Mongoose model, including all Mongoose-specific methods.
export type DocumentDocument = MongooseDocument & Document;

// @Schema() marks this class as a Mongoose schema.
// `timestamps: true` automatically adds `createdAt` and `updatedAt` fields
// to each document, which is great for tracking creation and modification times.
@Schema({ timestamps: true })
export class Document {
  @Prop({ required: true })
  projectId: string;

  // The title of the research document. `required: true` ensures this field
  // must be present.
  @Prop({ required: true })
  title: string;

  // The content of the document.
  @Prop({ required: true })
  content: string;

  // An array of strings to store tags.
  // The `[String]` syntax is shorthand for `type: [String]`.
  @Prop([String])
  tags: string[];
}

// SchemaFactory.createForClass() transforms the class definition into a
// Mongoose schema object that can be used by the `MongooseModule`.
export const DocumentSchema = SchemaFactory.createForClass(Document);
