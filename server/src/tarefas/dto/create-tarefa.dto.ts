import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { TarefaStatus } from '../enums/tarefa-status.enum';

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

  @IsArray()
  @IsOptional()
  teamIds?: string[];

  @IsString()
  @IsOptional()
  typeId?: string;

  @IsString()
  @IsOptional()
  stepId?: string;

  @IsEnum(TarefaStatus)
  @IsOptional()
  status?: TarefaStatus = TarefaStatus.TODO;
}
