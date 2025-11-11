import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjetosController } from './projetos.controller';
import { ProjetosService } from './projetos.service';
import { TimesService } from '../times/times.service';
import { Projeto, ProjetoSchema } from './projetos.schema';
import { GithubModule } from '../github/github.module';
import { AiModule } from '../ai/ai.module';
import { TarefasModule } from '../tarefas/tarefas.module';
import { GithubService } from '../github/github.service';
import { AiService } from '../ai/ai.service';
import { AuthModule } from '../auth/auth.module';
import { TimesModule } from '../times/times.module';
import { UsersModule } from '../users/users.module';
import { CliModule } from '../cli/cli.module';
import { Time, TimeSchema } from '../times/times.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Projeto.name, schema: ProjetoSchema }]),
    MongooseModule.forFeature([{ name: Time.name, schema: TimeSchema }]),
    GithubModule,
    AiModule,
    TarefasModule,
    AuthModule,
    UsersModule,
    TimesModule,
    CliModule,
  ],
  controllers: [ProjetosController],
  providers: [ProjetosService, GithubService, AiService],
})
export class ProjetosModule {}
