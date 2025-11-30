import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateTarefaStepDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsNotEmpty()
  projetoId: string;
}
