import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimesService } from './times.service';
import { ProjetosModule } from '../projetos/projetos.module';
import { Time, TimeSchema } from './times.schema';
import { Projeto, ProjetoSchema } from '../projetos/projetos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Time.name, schema: TimeSchema }]),
    MongooseModule.forFeature([{ name: Projeto.name, schema: ProjetoSchema }]),
  ],
  providers: [TimesService],
  exports: [TimesService],
})
export class TimesModule {}
