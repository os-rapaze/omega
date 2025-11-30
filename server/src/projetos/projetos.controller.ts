import {
  Param,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { ProjetosService } from './projetos.service';
import { GithubService } from '../github/github.service';
import { AiService } from '../ai/ai.service';
import { TarefasService } from '../tarefas/tarefas.service';
import { TimesService } from '../times/times.service';

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
    private readonly tarefasService: TarefasService,
    private readonly timesService: TimesService,
  ) {}

  @Post()
  async createProjeto(@Body() body: { name: string; workspaceId: string }) {
    return this.projetosService.createProjeto(body);
  }

  @Post(':id/link-github-user')
  async linkGithubToUser(
    @Body() body: { userId: string; githubUserId: string },
  ) {
    await this.githubService.linkGithubUserToUser(
      body.githubUserId,
      body.userId,
    );

    await this.timesService.assignUserToGithubUserTeams(
      body.githubUserId,
      body.userId,
    );

    return { success: true };
  }

  @Get()
  async getProjetos() {
    return this.projetosService.getProjetos();
  }

  @Get(':id')
  async getProjeto(@Param('id') id: string) {
    return this.projetosService.getProjeto(id);
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

      if (analysisResult.frontend_language) {
        this.timesService.create({ name: 'Frontend', projetoId: projetoId });
      }

      if (analysisResult.backend_language) {
        this.timesService.create({ name: 'Backend', projetoId: projetoId });
      }

      // lógica de analisar usuários, criar times e usuários
      const allCommits = await this.githubService.getCommits(
        projeto.github.owner!,
        projeto.github.repo!,
        projeto.github.accessToken!,
      );

      const commitsByAuthor = allCommits.reduce(
        (acc, commit) => {
          const name = commit.author?.name || 'unknown';
          const email = commit.author?.email || 'unknown';

          const key = `${name}:::${email}`;

          if (!acc[key]) acc[key] = [];
          acc[key].push(commit);

          return acc;
        },
        {} as Record<string, any[]>,
      );

      const result: Record<string, any[]> = {};

      for (const author in commitsByAuthor) {
        const authorCommits = commitsByAuthor[author];
        result[author] = authorCommits.slice(0, 3).map((commit) => commit.sha);
      }

      for (const author in result) {
        result[author] = await Promise.all(
          result[author].map(async (sha) => {
            return await this.githubService.getCommitDetails(
              projeto.github.owner!,
              projeto.github.repo!,
              sha,
              projeto.github.accessToken!,
            );
          }),
        );
      }

      this.aiService.buildTeamData(result, projetoId);

      return await this.projetosService.saveProjectInfo(
        projetoId,
        projectDataToSave,
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

  @Get(':id/tarefas')
  async getTarefas(@Param('id') projetoId: string) {
    const projeto = await this.projetosService.getProjeto(projetoId);

    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    if (!projeto.github?.connected) {
      throw new Error('Projeto não está conectado ao GitHub');
    }

    return this.tarefasService.getTarefas(projetoId);
  }

  @Get(':id/times')
  @UseGuards(CombinedAuthGuard)
  async getTimes(@Param('id') projetoId: string) {
    const projeto = await this.projetosService.getProjeto(projetoId);

    if (!projeto) {
      throw new Error('Projeto não encontrado');
    }

    return this.timesService.getTimes(projetoId);
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
