import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WorkspaceDocument = HydratedDocument<Workspace>;

@Schema()
export class Workspace {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  icon: string; // 👈 aqui vai o ícone/capa (base64 / data URL)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: string;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
