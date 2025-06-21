// src/ai/flows/follow-detection.ts
'use server';
/**
 * @fileOverview A flow for detecting if a user is being followed based on movement pattern anomalies.
 *
 * - detectFollowing - A function that initiates the follow detection process.
 * - FollowDetectionInput - The input type for the detectFollowing function.
 * - FollowDetectionOutput - The return type for the detectFollowing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FollowDetectionInputSchema = z.object({
  movementData: z.string().describe("A JSON string containing an array of GPS coordinates with timestamps. Each object in array contains 'latitude', 'longitude', and 'timestamp' fields."),
  typicalRoute: z.string().describe("A description of the user's typical route, including start and end points, and any usual deviations."),
});
export type FollowDetectionInput = z.infer<typeof FollowDetectionInputSchema>;

const FollowDetectionOutputSchema = z.object({
  isFollowing: z.boolean().describe('Whether or not the user is likely being followed.'),
  explanation: z.string().describe('An explanation of why the system believes the user is or is not being followed.'),
  suggestedActions: z.string().describe('A list of suggested actions the user should take if they are being followed.'),
});
export type FollowDetectionOutput = z.infer<typeof FollowDetectionOutputSchema>;

export async function detectFollowing(input: FollowDetectionInput): Promise<FollowDetectionOutput> {
  return detectFollowingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'followDetectionPrompt',
  input: {
    schema: FollowDetectionInputSchema,
  },
  output: {
    schema: FollowDetectionOutputSchema,
  },
  prompt: `You are an AI assistant designed to detect if a user is being followed based on their movement data.

Analyze the user's movement data and compare it to their typical route.  Look for anomalies such as:

*   Unexpected stops or delays
*   Deviations from the typical route
*   Movement patterns that suggest someone is intentionally following the user (e.g., mirroring their movements)

Based on your analysis, determine if the user is likely being followed.

Typical Route: {{{typicalRoute}}}
Movement Data: {{{movementData}}}

Consider the following when determining if the user is being followed:
- How closely the movement data matches the typical route.
- The presence of any anomalies in the movement data.
- The potential for the user to be in danger.

Output a JSON object in the following format:
{
  "isFollowing": true/false,  // Required
  "explanation": "...",      // Required: A detailed explanation of why you think the user is or is not being followed.
  "suggestedActions": "..." // Required: A list of suggested actions the user should take if they are being followed.
}
`,
});

const detectFollowingFlow = ai.defineFlow(
  {
    name: 'detectFollowingFlow',
    inputSchema: FollowDetectionInputSchema,
    outputSchema: FollowDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
