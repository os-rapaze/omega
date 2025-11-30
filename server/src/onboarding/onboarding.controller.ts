import {
  Controller,
  Request,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateUserOnboardingDto } from './dto/create-user-onboarding.dto';
import { CreateWorkspaceOnboardingDto } from './dto/create-workspace-onboarding.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CreateProjectOnboardingDto } from './dto/create-project-onboarding.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('user')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserOnboardingDto) {
    return this.onboardingService.createUser(createUserDto);
  }

  @Post('workspace')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createWorkspace(
    @Body() createWorkspaceDto: CreateWorkspaceOnboardingDto,
    @Request() req,
  ) {
    const userId = req.user?.sub;
    return this.onboardingService.createWorkspace(createWorkspaceDto, userId);
  }

  @Post('project')
  @HttpCode(HttpStatus.CREATED)
  async createProjectAndConnect(
    @Body() createProjectDto: CreateProjectOnboardingDto,
  ) {
    return this.onboardingService.createProjectAndConnect(createProjectDto);
  }
}
