import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TarefasService } from './tarefas.service';
import { CreateTarefaTypeDto } from './dto/create-tarefa-type.dto';
import { UpdateTarefaTypeDto } from './dto/update-tarefa-type.dto';

@Controller('tarefas-tipos')
export class TarefasTypesController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Post()
  async createType(@Body() dto: CreateTarefaTypeDto) {
    return this.tarefasService.createType(dto);
  }

  @Get('projeto/:projetoId')
  async getTypesByProjeto(@Param('projetoId') projetoId: string) {
    return this.tarefasService.getTypesByProjeto(projetoId);
  }

  @Patch(':typeId')
  async updateType(
    @Param('typeId') typeId: string,
    @Body() dto: UpdateTarefaTypeDto,
  ) {
    return this.tarefasService.updateType(typeId, dto);
  }

  @Delete(':typeId')
  async deleteType(@Param('typeId') typeId: string) {
    await this.tarefasService.deleteType(typeId);
    return { message: 'Type removido com sucesso.' };
  }
}
