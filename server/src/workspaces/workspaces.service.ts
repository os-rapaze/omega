import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Workspace, WorkspaceDocument } from './workspaces.schema';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async createWorkspace(data: {
    name: string;
    description?: string;
    icon?: string;
    userId?: string;
  }): Promise<Workspace> {
    // só pode uma workspace por banco, não vai dar de fazer workspace switcher a tempo :(
    //
    //

    if (!data?.userId) {
      throw new BadRequestException('Ocorreu um erro.');
    }

    const existingWorkspace = await this.workspaceModel.findOne();

    if (existingWorkspace) {
      throw new BadRequestException('Já existe uma workspace criada.');
    }

    const createdWorkspace = new this.workspaceModel({
      name: data.name,
      description: data.description,
      icon: data.icon,
      owner: data.userId,
    });
    return createdWorkspace.save();
  }

  async getWorkspaces(): Promise<Workspace[]> {
    return this.workspaceModel.find().exec();
  }

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    return this.workspaceModel.findById(id).exec();
  }

  async deleteWorkspace(id: string) {
    return this.workspaceModel.findByIdAndDelete(id).exec();
  }
}
