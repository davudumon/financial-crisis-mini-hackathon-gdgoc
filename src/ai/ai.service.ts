import { Inject, Injectable, Logger } from '@nestjs/common';
import type { GenerativeModel } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { GEMINI_MODEL } from './gemini.provider';
import {
  buildCreditScoringPrompt,
  PROMPT_VERSION,
} from './prompt.builder';
import {
  creditScoringSchema,
  type CreditScoringOutput,
} from './schemas/credit-scoring.schema';

export type ScoreBorrowerOptions = {
  borrowerId: string;
  temperature?: number;
  maxRetries?: number;
  promptVersion?: string;
  modelVersion?: string;
  inputForModel?: unknown;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJsonParse(text: string): unknown {
  // Gemini sometimes returns whitespace/newlines; keep parse strict.
  return JSON.parse(text);
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(GEMINI_MODEL) private readonly model: GenerativeModel,
  ) {}

  async scoreBorrower(options: ScoreBorrowerOptions): Promise<CreditScoringOutput> {
    const temperature = options.temperature ?? 0.2;
    const maxRetries = options.maxRetries ?? 2;
    const promptVersion = options.promptVersion ?? PROMPT_VERSION;
    const modelVersion = options.modelVersion ?? (process.env.GEMINI_MODEL ?? 'gemini-1.5-pro');

    const altData =
      options.inputForModel ??
      (await this.prisma.alternativeDataRaw.findMany({
        where: { borrowerId: options.borrowerId },
        orderBy: { createdAt: 'desc' },
        include: { ocrExtractions: { orderBy: { createdAt: 'desc' } } },
      }));

    const prompt = buildCreditScoringPrompt({
      borrowerId: options.borrowerId,
      alternativeData: altData,
    });

    const rawInputJson = {
      borrowerId: options.borrowerId,
      promptVersion,
      modelVersion,
      temperature,
      altData,
    };

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            responseMimeType: 'application/json',
          },
        } as any);

        const text = response.response.text();
        const parsed = safeJsonParse(text);
        const output = creditScoringSchema.parse(parsed);

        await this.prisma.aiScoringResult.create({
          data: {
            borrowerId: options.borrowerId,
            geminiDefaultProbability: output.default_probability,
            geminiCreditScore: output.credit_score,
            geminiAnalysisReason: output.analysis_reason,
            promptVersion,
            modelVersion,
            rawInputJson,
            geminiResponseJson: {
              text,
              output,
            } as any,
          },
          select: { id: true },
        });

        return output;
      } catch (err) {
        lastError = err;
        const delay = 400 * Math.pow(2, attempt);
        this.logger.warn(
          `Gemini scoring attempt ${attempt + 1}/${maxRetries + 1} failed; retrying in ${delay}ms`,
        );
        await sleep(delay);
      }
    }

    // audit the failure as well
    await this.prisma.aiScoringResult.create({
      data: {
        borrowerId: options.borrowerId,
        promptVersion,
        modelVersion,
        rawInputJson,
        geminiResponseJson: {
          error: String((lastError as any)?.message ?? lastError),
        } as any,
      },
      select: { id: true },
    });

    throw lastError;
  }

  async logOcrExtraction(params: {
    alternativeDataRawId: string;
    extractedText: string;
    confidence?: number;
    geminiResponseJson?: unknown;
  }) {
    return this.prisma.ocrExtraction.create({
      data: {
        alternativeDataRawId: params.alternativeDataRawId,
        extractedText: params.extractedText,
        confidence: params.confidence,
        geminiResponseJson: (params.geminiResponseJson ?? {}) as any,
      },
    });
  }
}
