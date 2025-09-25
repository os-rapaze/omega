import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ProjetosService } from './projetos.service';
import { GithubService } from '../github/github.service';
import { AiService } from '../ai/ai.service';

interface ProjectData {
  frontend_language: string;
  frontend_framework: string;
  backend_language: string;
  backend_framework: string;
}

@Controller('projetos')
export class ProjetosController {
  constructor(
    private readonly projetosService: ProjetosService,
    private readonly githubService: GithubService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  async createProjeto(@Body() body: { name: string; workspaceId: string }) {
    return this.projetosService.createProjeto(body);
  }

  @Post(':id/connect-github')
  async connectGithub(
    @Param('id') projetoId: string,
    @Body() body: { owner: string; repo: string; token: string },
  ) {
    try {
      const projeto = await this.projetosService.connectGithubRepo(
        projetoId,
        body.owner,
        body.repo,
        body.token,
      );

      if (!projeto) {
        throw new Error('projeto não encontrado');
      }

      if (!projeto.github?.connected) {
        throw new Error('projeto não conectado ao github');
      }

      const allFiles = await this.githubService.getRepoFiles(
        projeto.github.owner!,
        projeto.github.repo!,
        projeto.github.accessToken!,
        'main',
      );

      const filePathsToAnalyze = allFiles
        .filter((file) => {
          const path = file.path.toLowerCase();

          const ignoreList = [
            'node_modules/',
            'dist/',
            'build/',
            '.git/',
            '.vscode/',
            'package-lock.json',
            'yarn.lock',
          ];

          const shouldIgnore = ignoreList.some((item) => path.startsWith(item));
          const isImage = /\.(jpg|jpeg|png|gif|svg)$/.test(path);

          return !shouldIgnore && !isImage;
        })
        .map((file) => file.path);
      const analysisResult = await this.aiService.analyzeStructure(
        JSON.stringify(filePathsToAnalyze, null, 2),
      );

      const projectDataToSave: ProjectData = {
        frontend_language: analysisResult.frontend_language ?? '',
        backend_language: analysisResult.backend_language ?? '',
        frontend_framework: analysisResult.frontend_framework ?? '',
        backend_framework: analysisResult.backend_framework ?? '',
      };

      return await this.projetosService.saveProjectInfo(
        projetoId,
        projectDataToSave, // Passa o objeto com os tipos corrigidos
      );
    } catch (err: any) {}
  }

  @Get(':id/commits')
  async getCommits(@Param('id') projetoId: string) {
    const projeto = await this.projetosService.getProjeto(projetoId);

    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    if (!projeto.github?.connected) {
      throw new Error('Projeto não está conectado ao GitHub');
    }

    return this.githubService.getCommits(
      projeto.github.owner!,
      projeto.github.repo!,
      projeto.github.accessToken!,
    );
  }

  @Get(':id/commits/:sha')
  async getCommitDetails(
    @Param('id') projetoId: string,
    @Param('sha') commitSha: string,
  ) {
    const projeto = await this.projetosService.getProjeto(projetoId);

    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    if (!projeto.github?.connected) {
      throw new Error('Projeto não está conectado ao GitHub');
    }

    return this.githubService.getCommitDetails(
      projeto.github.owner!,
      projeto.github.repo!,
      commitSha,
      projeto.github.accessToken!,
    );
  }

  @Get(':id/ai/analyze/:branch')
  async getRepoFiles(
    @Param('id') projetoId: string,
    @Param('branch') branch?: string,
  ): Promise<any> {
    const projeto = await this.projetosService.getProjeto(projetoId);

    if (!projeto) {
      throw new Error('projeto não encontrado');
    }

    if (!projeto.github?.connected) {
      throw new Error('projeto não conectado ao github');
    }

    const allFiles = await this.githubService.getRepoFiles(
      projeto.github.owner!,
      projeto.github.repo!,
      projeto.github.accessToken!,
      branch,
    );

    const filePathsToAnalyze = allFiles
      .filter((file) => {
        const path = file.path.toLowerCase();

        const ignoreList = [
          'node_modules/',
          'dist/',
          'build/',
          '.git/',
          '.vscode/',
          'package-lock.json',
          'yarn.lock',
        ];

        const shouldIgnore = ignoreList.some((item) => path.startsWith(item));
        const isImage = /\.(jpg|jpeg|png|gif|svg)$/.test(path);

        return !shouldIgnore && !isImage;
      })
      .map((file) => file.path);
    const analysisResult = await this.aiService.analyzeStructure(
      JSON.stringify(filePathsToAnalyze, null, 2),
    );

    return analysisResult;
  }
}
