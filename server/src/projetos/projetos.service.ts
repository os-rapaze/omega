import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Projeto, ProjetoDocument } from './projetos.schema';
import { GithubService } from '../github/github.service';
import { AiService } from '../ai/ai.service';
import { TarefasService } from '../tarefas/tarefas.service';

interface ProjectData {
  frontend_language: string;
  frontend_framework: string;
  backend_language: string;
  backend_framework: string;
}

@Injectable()
export class ProjetosService {
  constructor(
    @InjectModel(Projeto.name)
    private projetosModel: Model<ProjetoDocument>,
    private readonly githubService: GithubService,
    private readonly aiService: AiService,
    private readonly tarefasService: TarefasService,
  ) {}

  async createProjeto(data: { name: string; workspaceId: string }) {
    const projeto = new this.projetosModel(data);
    return projeto.save();
  }

  async connectGithubRepo(
    projetoId: string,
    owner: string,
    repo: string,
    token: string,
  ) {
    try {
      await this.githubService.getCommits(owner, repo, token);
    } catch (error) {
      console.error(
        'Falha ao conectar ao repositório do GitHub:',
        error.message,
      );
      throw new BadRequestException(
        'Não foi possível conectar ao repositório. Verifique o owner, nome do repositório e o token de acesso.',
      );
    }

    const projeto = await this.projetosModel.findById(projetoId).exec();
    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    projeto.github = {
      owner,
      repo,
      accessToken: token,
      connected: true,
    };

    return projeto.save();
  }

  async saveProjectInfo(project_id: string, data: ProjectData) {
    const projeto = await this.projetosModel.findById(project_id).exec();
    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    projeto.frontend = {
      language: data.frontend_language,
      framework: data.frontend_framework,
    };

    projeto.backend = {
      language: data.backend_language,
      framework: data.backend_framework,
    };

    return projeto.save();
  }

  async getProjeto(projetoId: string) {
    return this.projetosModel
      .findById(projetoId)
      .populate('workspaceId')
      .exec();
  }
}
