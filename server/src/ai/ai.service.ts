import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { UsersService } from '../users/users.service';
import { TimesService } from '../times/times.service';
import { Time, TimeDocument } from '../times/times.schema';

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly timesService: TimesService,
    @InjectModel(Time.name) private timeModel: Model<TimeDocument>,
  ) {}

  async buildTeamData(data: Record<string, any[]>, projetoId: string) {
    const groqApiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!groqApiKey) {
      throw new Error(
        'GROQ_API_KEY não está definida nas variáveis de ambiente.',
      );
    }

    const groq = new Groq({
      apiKey: groqApiKey,
    });

    const promptContent = `Analyze the provided GitHub commit details. Based on the detected technologies and work performed, determine in which area(s) the user is skilled.

Return the response ONLY as a JSON object with the following keys:
- \`skill\` (string): one of "frontend", "backend", "fullstack", or "unknown".
- \`reasons\` (string): a short explanation of why that classification was chosen.

Detection rules:
- If commit changes involve only UI, styling, HTML, CSS, JavaScript frameworks like React / Vue / Angular, or frontend-focused work → classify as "frontend".
- If commit changes involve server logic, APIs, Node.js, PHP, Laravel, NestJS, Python backend, etc. → classify as "backend".
- If commits show meaningful contributions to BOTH frontend and backend → classify as "fullstack".
- If no clear detection is possible → classify as "unknown".

Ensure the output is a valid JSON string and nothing else.`;

    const result: Array<{ username: string; skill: string; reasons: string }> =
      [];

    const normalizedUsernames = Object.keys(data).map((name) =>
      name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '_'),
    );

    const originalUsernames = Object.keys(data);

    for (let i = 0; i < originalUsernames.length; i++) {
      const originalName = originalUsernames[i];
      const username = normalizedUsernames[i];
      const commits = data[originalName];

      const user = await this.usersService.create({
        username,
        password: 'omega',
      });

      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant that provides information in JSON format.',
            },
            { role: 'user', content: promptContent },
            { role: 'user', content: JSON.stringify(commits) },
          ],
          model: 'openai/gpt-oss-20b',
          response_format: { type: 'json_object' },
        });

        const rawContent = chatCompletion.choices[0]?.message?.content;
        if (!rawContent) throw new Error('Resposta da IA vazia');

        const parsed = JSON.parse(rawContent);
        if (!parsed.skill || !parsed.reasons)
          throw new Error('Resposta JSON incompleta');

        result.push({
          username,
          skill: parsed.skill,
          reasons: parsed.reasons,
        });

        if (parsed.skill == 'fullstack') {
          const timeBackend = await this.timeModel.findOne({
            projetoId,
            name: 'Backend',
          });

          const timeFrontend = await this.timeModel.findOne({
            projetoId,
            name: 'Frontend',
          });

          if (timeFrontend) {
            await this.timesService.assignUser(
              timeFrontend._id.toString(),
              user._id.toString(),
            );
          }

          if (timeBackend) {
            await this.timesService.assignUser(
              timeBackend._id.toString(),
              user._id.toString(),
            );
          }

          return this.timeModel.find({ projetoId }).populate('members');
        } else if (parsed.skill == 'backend') {
          const timeBackend = await this.timeModel.findOne({
            projetoId,
            name: 'Backend',
          });

          if (timeBackend) {
            await this.timesService.assignUser(
              timeBackend._id.toString(),
              user._id.toString(),
            );
          }
        } else if (parsed.skill == 'frontend') {
          const timeFrontend = await this.timeModel.findOne({
            projetoId,
            name: 'Frontend',
          });

          if (timeFrontend) {
            await this.timesService.assignUser(
              timeFrontend._id.toString(),
              user._id.toString(),
            );
          }
        } else {
          console.error(`Erro ao processar usuário ${username}:`);
        }
      } catch (err) {
        console.error(`Erro ao processar usuário ${username}:`, err);

        result.push({
          username,
          skill: 'unknown',
          reasons: 'Erro ao analisar commits.',
        });
      }
    }
  }

  async analyzeStructure(data: string): Promise<{
    frontend_language: string | null;
    backend_language: string | null;
    frontend_framework: string | null;
    backend_framework: string | null;
  }> {
    const groqApiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!groqApiKey) {
      throw new Error(
        'GROQ_API_KEY não está definida nas variáveis de ambiente.',
      );
    }

    const groq = new Groq({
      apiKey: groqApiKey,
    });

    const promptContent = `Analyze the provided GitHub repository file paths. Identify the main frontend language (e.g., tsx, html, css, javascript), backend language (e.g., php, java, python, nodejs), frontend framework (if any, e.g., React, Angular, Vue), and backend framework (if any, e.g., Laravel, Spring Boot, Express). Return the response ONLY as a JSON object with the following keys: \n- \`frontend_language\` (string or null)\n- \`backend_language\` (string or null)\n- \`frontend_framework\` (string or null)\n- \`backend_framework\` (string or null)\n\nIf a language or framework is not detected, use \`null\` for its value. Ensure the output is a valid JSON string and nothing else.`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that provides information in JSON format.',
          },
          {
            role: 'user',
            content: promptContent,
          },
          {
            role: 'user',
            content: data,
          },
        ],
        model: 'openai/gpt-oss-20b',
        response_format: { type: 'json_object' },
      });

      const rawContent = chatCompletion.choices[0]?.message?.content;

      if (!rawContent) {
        throw new Error('A resposta da IA está vazia.');
      }

      const parsedContent = JSON.parse(rawContent);

      const requiredKeys = [
        'frontend_language',
        'backend_language',
        'frontend_framework',
        'backend_framework',
      ];
      for (const key of requiredKeys) {
        if (!(key in parsedContent)) {
          throw new Error(
            `A resposta JSON da IA não contém a chave esperada: ${key}`,
          );
        }
      }

      return parsedContent;
    } catch (error) {
      console.error('Erro ao analisar a estrutura do repositório:', error);
      return {
        frontend_language: null,
        backend_language: null,
        frontend_framework: null,
        backend_framework: null,
      };
    }
  }
}
