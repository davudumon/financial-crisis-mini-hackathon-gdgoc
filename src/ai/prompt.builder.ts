type PromptInput = {
  borrowerId: string;
  borrowerProfile?: {
    name?: string | null;
    businessType?: string | null;
  };
  alternativeData?: unknown;
};

export const PROMPT_VERSION = 'v1';

export function buildCreditScoringPrompt(input: PromptInput): string {
  const borrower = {
    borrowerId: input.borrowerId,
    ...input.borrowerProfile,
  };

  return [
    'You are a credit risk assistant for micro-lending (UMKM).',
    'Return ONLY valid JSON that matches this schema:',
    '{"default_probability": number (0..1), "credit_score": integer (0..1000), "analysis_reason": string}.',
    'Do not include markdown, code fences, or extra keys.',
    '',
    `borrower: ${JSON.stringify(borrower)}`,
    `alternative_data: ${JSON.stringify(input.alternativeData ?? {})}`,
  ].join('\n');
}
