import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTarefaHistoryDto {
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsString()
  @IsNotEmpty()
  elapsedTime: string;

  @IsString()
  @IsNotEmpty()
  tarefaId: string;
}
