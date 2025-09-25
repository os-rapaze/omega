import { Injectable } from '@nestjs/common';
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
  }): Promise<Workspace> {
    const createdWorkspace = new this.workspaceModel(data);
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
