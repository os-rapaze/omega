import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Projeto } from '../projetos/projetos.schema';
import { User } from '../users/schemas/user.schema';
import { TarefaStep } from './tarefas-step.schema';
import { TarefaType } from './tarefas-type.schema';
import { TarefaStatus } from './enums/tarefa-status.enum';

export type TarefaDocument = HydratedDocument<Tarefa>;

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

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'TarefaType',
    required: false,
  })
  typeId?: TarefaType;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'TarefaStep',
    required: false,
  })
  stepId?: TarefaStep;

  @Prop({
    type: String,
    enum: Object.values(TarefaStatus),
    default: TarefaStatus.TODO,
  })
  status: TarefaStatus;

  @Prop({ required: false })
  deadlineHours?: number;
}

export const TarefaSchema = SchemaFactory.createForClass(Tarefa);

TarefaSchema.pre('save', function (next) {
  if (!this.hash) {
    this.hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});
