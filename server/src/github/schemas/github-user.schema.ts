import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Projeto } from '../../projetos/projetos.schema';
import { User } from '../../users/schemas/user.schema';

export type GithubUserDocument = HydratedDocument<GithubUser>;

@Schema()
export class GithubUser {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Projeto' })
  projetoId: Projeto | string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  userId?: User | string;
}

export const GithubUserSchema = SchemaFactory.createForClass(GithubUser);
