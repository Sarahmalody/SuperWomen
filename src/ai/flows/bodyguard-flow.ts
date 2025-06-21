'use server';
/**
 * @fileOverview A flow to generate a fake phone call audio.
 *
 * - generateFakeCallAudio - A function that generates audio for a fake call.
 * - FakeCallInput - The input type for the generateFakeCallAudio function.
 * - FakeCallOutput - The return type for the generateFakeCallAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const FakeCallInputSchema = z.object({
  script: z.string().describe('The script for the phone call.'),
});
export type FakeCallInput = z.infer<typeof FakeCallInputSchema>;

const FakeCallOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The generated audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'."
    ),
});
export type FakeCallOutput = z.infer<typeof FakeCallOutputSchema>;

export async function generateFakeCallAudio(
  input: FakeCallInput
): Promise<FakeCallOutput> {
  return bodyguardFlow(input);
}

const bodyguardFlow = ai.defineFlow(
  {
    name: 'bodyguardFlow',
    inputSchema: FakeCallInputSchema,
    outputSchema: FakeCallOutputSchema,
  },
  async ({script}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Alkaid is described as a mature male voice. This is a best effort for "Indian dad voice".
            prebuiltVoiceConfig: {voiceName: 'Alkaid'},
          },
        },
      },
      prompt: script,
    });

    if (!media) {
      throw new Error('Audio generation failed.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavData = await toWav(audioBuffer);
    const audioDataUri = 'data:audio/wav;base64,' + wavData;

    return {audioDataUri};
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
