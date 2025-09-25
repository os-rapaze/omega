import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { TarefaType } from '../tarefas.schema';

export class CreateTarefaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  projetoId: string;

  @IsArray()
  @IsOptional()
  userIds?: string[];

  @IsEnum(TarefaType)
  @IsNotEmpty()
  type: TarefaType;
}
