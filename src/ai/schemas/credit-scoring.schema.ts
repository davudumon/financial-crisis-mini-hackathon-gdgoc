import { z } from 'zod';

export const creditScoringSchema = z
  .object({
    default_probability: z
      .number()
      .min(0)
      .max(1)
      .describe('Probability of default within next 12 months (0..1).'),
    credit_score: z
      .number()
      .int()
      .min(0)
      .max(1000)
      .describe('Internal credit score 0..1000.'),
    analysis_reason: z
      .string()
      .min(1)
      .max(4000)
      .describe('Short explanation of the decision.'),
  })
  .strict();

export type CreditScoringOutput = z.infer<typeof creditScoringSchema>;
