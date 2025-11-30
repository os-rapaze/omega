import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWorkspaceOnboardingDto {
  @IsNotEmpty()
  @IsString()
  workspaceName: string;

  @IsNotEmpty()
  @IsString()
  workspaceDescription: string;

  @IsOptional()
  @IsString()
  workspaceIcon?: string;
}
