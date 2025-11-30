import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TarefasHistoryService } from './tarefas-history.service';
import { CreateTarefaHistoryDto } from './dto/create-tarefa-history.dto';
import { TarefaHistoryDocument } from './tarefas-history.schema';

@Controller('tarefas')
export class TarefasHistoryController {
  constructor(private readonly tarefasHistoryService: TarefasHistoryService) {}

  @Post('history')
  async createHistory(
    @Body() body: CreateTarefaHistoryDto,
  ): Promise<TarefaHistoryDocument> {
    return this.tarefasHistoryService.create(body);
  }

  @Get(':tarefaId/history')
  async getHistoryByTarefa(
    @Param('tarefaId') tarefaId: string,
  ): Promise<TarefaHistoryDocument[]> {
    return this.tarefasHistoryService.findByTarefa(tarefaId);
  }

  @Get(':tarefaId/history/elapsed')
  async getTotalElapsedByTarefa(
    @Param('tarefaId') tarefaId: string,
  ): Promise<{ tarefaId: string; totalElapsedTime: number }> {
    const totalElapsedTime =
      await this.tarefasHistoryService.getTotalElapsedByTarefa(tarefaId);

    return {
      tarefaId,
      totalElapsedTime,
    };
  }
}
