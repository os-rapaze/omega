import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

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
        response_format: { type: 'json_object' }, // Explicitly request JSON object
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
