import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Workspace } from '../workspaces/workspaces.schema';

export class Github {
  @Prop()
  owner: string;

  @Prop()
  repo: string;

  @Prop({ default: false })
  connected: boolean;

  @Prop()
  accessToken: string;
}

export class Frontend {
  @Prop({ type: String, required: true })
  language: string;
  @Prop({ type: String })
  framework?: string;
}

export class Backend {
  @Prop({ type: String, required: true })
  language: string;

  @Prop({ type: String })
  framework?: string;
}

export type ProjetoDocument = HydratedDocument<Projeto>;

@Schema()
export class Projeto {
  @Prop({ maxlength: 255 })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace' })
  workspaceId: Workspace;

  @Prop({ type: Github })
  github: Github;

  @Prop({ type: Frontend })
  frontend?: Frontend;

  @Prop({ type: Backend })
  backend?: Backend;
}

export const ProjetoSchema = SchemaFactory.createForClass(Projeto);
