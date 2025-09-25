import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tarefa, TarefaDocument, TarefaType } from './tarefas.schema';
import { Projeto, ProjetoDocument } from '../projetos/projetos.schema';
import { CreateTarefaDto } from './dto/create-tarefa.dto';

@Injectable()
export class TarefasService {
  constructor(
    @InjectModel(Tarefa.name) private tarefaModel: Model<TarefaDocument>,
    @InjectModel(Projeto.name) private projetoModel: Model<ProjetoDocument>,
  ) {}

  async createTarefa(createTarefaDto: CreateTarefaDto): Promise<Tarefa> {
    const projeto = await this.projetoModel
      .findById(createTarefaDto.projetoId)
      .exec();

    if (!projeto) {
      throw new BadRequestException('Projeto não encontrado.');
    }

    if (createTarefaDto.type === TarefaType.FRONTEND && !projeto.frontend) {
      throw new BadRequestException(
        'Este projeto não suporta tarefas de frontend.',
      );
    }

    if (createTarefaDto.type === TarefaType.BACKEND && !projeto.backend) {
      throw new BadRequestException(
        'Este projeto não suporta tarefas de backend.',
      );
    }

    const createdTarefa = new this.tarefaModel(createTarefaDto);
    return createdTarefa.save();
  }

  async getTarefa(tarefaId: string) {
    return this.tarefaModel.findById(tarefaId).populate('projetoId').exec();
  }
  async getTarefas(projetoId: string): Promise<Tarefa[]> {
    return this.tarefaModel.find({ projetoId }).exec();
  }
}
