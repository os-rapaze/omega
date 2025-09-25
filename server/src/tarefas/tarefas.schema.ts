import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Projeto } from '../projetos/projetos.schema';
import { User } from '../users/schemas/user.schema';

export type TarefaDocument = HydratedDocument<Tarefa>;

export enum TarefaType {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
}

export enum TarefaStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  BLOCKED = 'blocked',
}

@Schema()
export class Tarefa {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ maxlength: 6, unique: true })
  hash: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Projeto' })
  projetoId: Projeto;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  userIds: User[];

  @Prop({ required: true, type: String, enum: TarefaType })
  type: TarefaType;

  @Prop({
    required: true,
    type: String,
    enum: TarefaStatus,
    default: TarefaStatus.TODO,
  })
  status: TarefaStatus;
}

export const TarefaSchema = SchemaFactory.createForClass(Tarefa);

TarefaSchema.pre('save', function (next) {
  if (!this.hash) {
    this.hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});
