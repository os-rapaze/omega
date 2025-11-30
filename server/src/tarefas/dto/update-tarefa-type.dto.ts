import { PartialType } from '@nestjs/mapped-types';
import { CreateTarefaTypeDto } from './create-tarefa-type.dto';

export class UpdateTarefaTypeDto extends PartialType(CreateTarefaTypeDto) {}
