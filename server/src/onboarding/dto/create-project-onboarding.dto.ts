import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectOnboardingDto {
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsNotEmpty()
  @IsString()
  projectDescription: string;

  @IsNotEmpty()
  @IsString()
  // Em um cenário real, este token precisaria de validação mais robusta e tratamento seguro.
  githubToken: string;

  @IsNotEmpty()
  @IsString()
  // Em um cenário real, esta chave precisaria de validação mais robusta e tratamento seguro.
  groqApiKey: string;
}
