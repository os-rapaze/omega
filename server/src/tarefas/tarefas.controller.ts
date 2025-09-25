import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { TarefasService } from './tarefas.service';
import { CreateTarefaDto } from './dto/create-tarefa.dto';

@Controller('tarefas')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Post()
  async createTarefa(@Body() createTarefaDto: CreateTarefaDto) {
    return this.tarefasService.createTarefa(createTarefaDto);
  }

  @Get(':id')
  async getTarefa(@Param('id') id: string) {
    return this.tarefasService.getTarefa(id);
  }
}
