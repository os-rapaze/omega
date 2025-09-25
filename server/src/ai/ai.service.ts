import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

  async analyzeStructure(data: string) {
    const groqApiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!groqApiKey) {
      throw new Error(
        'GROQ_API_KEY não está definida nas variáveis de ambiente.',
      );
    }

    const groq = new Groq({
      apiKey: groqApiKey,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content:
            'Analyze the provided GitHub repository file paths. Identify the main frontend language (e.g., tsx, html, css, javascript), backend language (e.g., php, java, python, nodejs), frontend framework (if any, e.g., React, Angular, Vue), and backend framework (if any, e.g., Laravel, Spring Boot, Express). Return the response as a JSON object with the following keys: `frontend_language`, `backend_language`, `frontend_framework`, `backend_framework`. If a language or framework is not detected, use `null` for its value.',
        },
        { role: 'user', content: data },
      ],
      model: 'openai/gpt-oss-20b',
    });

    return chatCompletion.choices[0]?.message?.content || '';
  }
}
