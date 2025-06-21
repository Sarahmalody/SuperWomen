'use server';

/**
 * @fileOverview Provides safety advice based on the current risk assessment for the user's location.
 *
 * - getSafetyAdvice - A function that takes a location description and returns tailored safety advice.
 * - RiskAssessmentInput - The input type for the getSafetyAdvice function.
 * - RiskAssessmentOutput - The return type for the getSafetyAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RiskAssessmentInputSchema = z.object({
  locationDescription: z
    .string()
    .describe("A detailed description of the user's current location, including street names, landmarks, and any relevant observations."),
});

export type RiskAssessmentInput = z.infer<typeof RiskAssessmentInputSchema>;

const RiskAssessmentOutputSchema = z.object({
  riskLevel: z
    .string()
    .describe('The overall risk level of the location (e.g., low, medium, high).'),
  safetyAdvice: z
    .array(z.string())
    .describe('Specific safety advice tailored to the location and risk level.'),
  preferredRoute: z
    .string()
    .optional()
    .describe('A recommended walking route, if applicable, that minimizes risk.'),
  areasToAvoid: z
    .array(z.string())
    .optional()
    .describe('Specific areas or streets to avoid in the location, if any.'),
});

export type RiskAssessmentOutput = z.infer<typeof RiskAssessmentOutputSchema>;

export async function getSafetyAdvice(input: RiskAssessmentInput): Promise<RiskAssessmentOutput> {
  return riskAssessmentFlow(input);
}

const riskAssessmentPrompt = ai.definePrompt({
  name: 'riskAssessmentPrompt',
  input: {schema: RiskAssessmentInputSchema},
  output: {schema: RiskAssessmentOutputSchema},
  prompt: `You are a safety expert providing advice based on location risk assessment.

  Analyze the following location description and provide tailored safety advice:
  Location Description: {{{locationDescription}}}

  Consider factors such as crime rates, visibility, traffic, and any other relevant safety concerns.

  Provide the output in JSON format:
  - riskLevel: (e.g., low, medium, high)
  - safetyAdvice: ["Specific safety advice 1", "Specific safety advice 2"]
  - preferredRoute: (Optional) A recommended walking route that minimizes risk.
  - areasToAvoid: (Optional) Specific areas or streets to avoid.
  `,
});

const riskAssessmentFlow = ai.defineFlow(
  {
    name: 'riskAssessmentFlow',
    inputSchema: RiskAssessmentInputSchema,
    outputSchema: RiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await riskAssessmentPrompt(input);
    return output!;
  }
);
