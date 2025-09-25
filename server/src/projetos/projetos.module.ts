import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjetosController } from './projetos.controller';
import { ProjetosService } from './projetos.service';
import { Projeto, ProjetoSchema } from './projetos.schema';
import { GithubModule } from '../github/github.module';
import { AiModule } from '../ai/ai.module';
import { TarefasModule } from '../tarefas/tarefas.module';
import { GithubService } from '../github/github.service';
import { AiService } from '../ai/ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Projeto.name, schema: ProjetoSchema }]),
    GithubModule,
    AiModule,
    TarefasModule,
  ],
  controllers: [ProjetosController],
  providers: [ProjetosService, GithubService, AiService],
})
export class ProjetosModule {}
