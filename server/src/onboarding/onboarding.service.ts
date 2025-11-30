// onboarding.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { CreateUserOnboardingDto } from './dto/create-user-onboarding.dto';
import { CreateWorkspaceOnboardingDto } from './dto/create-workspace-onboarding.dto';
import { CreateProjectOnboardingDto } from './dto/create-project-onboarding.dto';
import { UsersService } from '../users/users.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
    private readonly authService: AuthService, // 👈 novo
  ) {}

  async createUser(data: CreateUserOnboardingDto) {
    this.logger.log(
      `Processando criação de usuário (onboarding): ${data.username}`,
    );

    const { access_token } = await this.authService.signUp({
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
    } as any); // se o tipo gritar, você pode alinhar os DTOs (já falo disso abaixo)

    const user = await this.usersService.findOne(data.username);

    return {
      access_token,
      user,
    };
  }

  async createWorkspace(data: CreateWorkspaceOnboardingDto, userId: string) {
    this.logger.log(`Processando criação de workspace: ${data.workspaceName}`);

    return this.workspacesService.createWorkspace({
      name: data.workspaceName,
      description: data.workspaceDescription,
      icon: data.workspaceIcon,
      userId,
    });
  }

  async createProjectAndConnect(data: CreateProjectOnboardingDto) {
    this.logger.log(`Processando criação de projeto: ${data.projectName}`);

    return {
      success: true,
      message: 'Projeto e conexões configurados com sucesso.',
      projectId: 'proj-789',
    };
  }
}
