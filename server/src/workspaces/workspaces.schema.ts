import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorkspaceDocument = HydratedDocument<Workspace>;

@Schema()
export class Workspace {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
