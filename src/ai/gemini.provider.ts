import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger, Provider } from '@nestjs/common';

export const GEMINI_MODEL = Symbol('GEMINI_MODEL');

const logger = new Logger('GeminiProvider');

export const geminiModelProvider: Provider = {
  provide: GEMINI_MODEL,
  useFactory: () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-pro';

    // Allow the rest of the API to run without Gemini configured.
    // The AI endpoints will fail fast with a clear error when called.
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY is not set; AI scoring endpoints will fail until configured.');
      return {
        async generateContent() {
          throw new Error('GEMINI_API_KEY is not configured');
        },
      } as any;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
  },
};
