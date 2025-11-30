import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateTarefaTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  projetoId: string;
}
