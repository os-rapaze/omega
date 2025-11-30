import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Projeto } from '../projetos/projetos.schema';

export type TarefaTypeDocument = HydratedDocument<TarefaType>;

@Schema()
export class TarefaType {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Projeto',
  })
  projetoId: Projeto;
}

export const TarefaTypeSchema = SchemaFactory.createForClass(TarefaType);
