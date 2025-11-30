import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TarefasService } from './tarefas.service';
import { CreateTarefaStepDto } from './dto/create-tarefa-step.dto';
import { UpdateTarefaStepDto } from './dto/update-tarefa-step.dto';

@Controller('tarefas-steps')
export class TarefasStepsController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Post()
  createStep(@Body() dto: CreateTarefaStepDto) {
    return this.tarefasService.createStep(dto);
  }

  @Get('projeto/:projetoId')
  getStepsByProjeto(@Param('projetoId') projetoId: string) {
    return this.tarefasService.getStepsByProjeto(projetoId);
  }

  @Patch(':id')
  updateStep(@Param('id') id: string, @Body() dto: UpdateTarefaStepDto) {
    return this.tarefasService.updateStep(id, dto);
  }

  @Delete(':id')
  deleteStep(@Param('id') id: string) {
    return this.tarefasService.deleteStep(id);
  }
}
