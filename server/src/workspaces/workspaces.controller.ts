import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createWorkspace(
    @Body() body: { name: string; description?: string; userId?: string },
    @Request() req,
  ) {
    body.userId = req.user.id;
    return this.workspacesService.createWorkspace(body);
  }

  @Get()
  async getWorkspaces() {
    return this.workspacesService.getWorkspaces();
  }

  @Get(':id')
  async getWorkspace(@Param('id') id: string) {
    return this.workspacesService.getWorkspaceById(id);
  }

  @Delete(':id')
  async deleteWorkspace(@Param('id') id: string) {
    return this.workspacesService.deleteWorkspace(id);
  }
}
