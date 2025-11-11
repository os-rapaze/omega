import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { WorkspacesModule } from './workspaces/workspaces.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CliModule } from './cli/cli.module';
import { ProjetosModule } from './projetos/projetos.module';
import { GithubModule } from './github/github.module';
import { AiModule } from './ai/ai.module';
import { TarefasModule } from './tarefas/tarefas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/omega', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    }),

    AuthModule,
    UsersModule,
    WorkspacesModule,
    ProjetosModule,
    GithubModule,
    AiModule,
    TarefasModule,
    CliModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
