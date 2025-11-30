import { PartialType } from '@nestjs/mapped-types';
import { CreateTarefaStepDto } from './create-tarefa-step.dto';

export class UpdateTarefaStepDto extends PartialType(CreateTarefaStepDto) {}
