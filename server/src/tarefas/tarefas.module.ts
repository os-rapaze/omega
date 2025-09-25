import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TarefasController } from './tarefas.controller';
import { TarefasService } from './tarefas.service';
import { Tarefa, TarefaSchema } from './tarefas.schema';
import { Projeto, ProjetoSchema } from '../projetos/projetos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tarefa.name, schema: TarefaSchema }]),
    MongooseModule.forFeature([{ name: Projeto.name, schema: ProjetoSchema }]),
  ],
  controllers: [TarefasController],
  providers: [TarefasService],
  exports: [TarefasService],
})
export class TarefasModule {}
