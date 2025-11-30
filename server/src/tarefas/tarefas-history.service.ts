// tarefas-history.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TarefaHistory, TarefaHistoryDocument } from './tarefas-history.schema';
import { CreateTarefaHistoryDto } from './dto/create-tarefa-history.dto';

@Injectable()
export class TarefasHistoryService {
  constructor(
    @InjectModel(TarefaHistory.name)
    private readonly tarefaHistoryModel: Model<TarefaHistoryDocument>,
  ) {}

  async create(dto: CreateTarefaHistoryDto): Promise<TarefaHistoryDocument> {
    const created = new this.tarefaHistoryModel(dto);
    return created.save();
  }

  async findByTarefa(tarefaId: string): Promise<TarefaHistoryDocument[]> {
    return this.tarefaHistoryModel
      .find({ tarefaId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<TarefaHistoryDocument[]> {
    return this.tarefaHistoryModel.find().sort({ createdAt: -1 }).exec();
  }

  async getTotalElapsedByTarefa(tarefaId: string): Promise<number> {
    const history = await this.tarefaHistoryModel
      .find({ tarefaId })
      .select('elapsedTime')
      .exec();

    const total = history.reduce((sum, item) => {
      const value = Number(item.elapsedTime ?? 0);
      if (Number.isNaN(value)) return sum;
      return sum + value;
    }, 0);

    return total;
  }
}
