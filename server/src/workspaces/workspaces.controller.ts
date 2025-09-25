import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  async createWorkspace(@Body() body: { name: string; description?: string }) {
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
