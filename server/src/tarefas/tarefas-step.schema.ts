import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Projeto } from '../projetos/projetos.schema';

export type TarefaStepDocument = HydratedDocument<TarefaStep>;

@Schema()
export class TarefaStep {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  color: string; // ex: "#FF0000"

  @Prop({ default: 0 })
  order: number; // posição da coluna no kanban

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Projeto',
  })
  projetoId: Projeto;
}

export const TarefaStepSchema = SchemaFactory.createForClass(TarefaStep);
