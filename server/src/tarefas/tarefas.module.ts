import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TarefasController } from './tarefas.controller';
import { TarefasStepsController } from './tarefas-steps.controller';
import { TarefasTypesController } from './tarefas-types.controller';
import { TarefasHistoryController } from './tarefas-history.controller';
import { TarefasService } from './tarefas.service';
import { TarefasHistoryService } from './tarefas-history.service';
import { Tarefa, TarefaSchema } from './tarefas.schema';
import { TarefaStep, TarefaStepSchema } from './tarefas-step.schema';
import { TarefaType, TarefaTypeSchema } from './tarefas-type.schema';
import { TarefaHistory, TarefaHistorySchema } from './tarefas-history.schema';
import { Projeto, ProjetoSchema } from '../projetos/projetos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tarefa.name, schema: TarefaSchema },
      { name: Projeto.name, schema: ProjetoSchema },
      { name: TarefaStep.name, schema: TarefaStepSchema },
      { name: TarefaHistory.name, schema: TarefaHistorySchema },
      { name: TarefaType.name, schema: TarefaTypeSchema },
    ]),
  ],
  controllers: [
    TarefasController,
    TarefasStepsController,
    TarefasTypesController,
    TarefasHistoryController,
  ],
  providers: [TarefasService, TarefasHistoryService],
  exports: [TarefasService, TarefasHistoryService],
})
export class TarefasModule {}
