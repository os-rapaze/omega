import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Tarefa } from './tarefas.schema';

export type TarefaHistoryDocument = HydratedDocument<TarefaHistory>;

@Schema({ timestamps: true })
export class TarefaHistory {
  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  elapsedTime: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Tarefa',
  })
  tarefaId: Tarefa;
}

export const TarefaHistorySchema = SchemaFactory.createForClass(TarefaHistory);
