// src/app/actions.ts
"use server";

import { z } from "zod";
import type { RiskAssessmentOutput } from "@/ai/flows/risk-assessment";
import { detectFollowing, type FollowDetectionOutput } from "@/ai/flows/follow-detection";
import { detectDistress } from "@/ai/flows/distress-detection";
import { generateFakeCallAudio } from "@/ai/flows/bodyguard-flow";

const riskSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  locationDescription: z.string().min(10, "Please provide a more detailed description."),
});

export async function assessRisk(prevState: any, formData: FormData) {
  try {
    const validatedFields = riskSchema.safeParse({
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      locationDescription: formData.get("locationDescription"),
    });

    if (!validatedFields.success) {
      return {
        type: "error" as const,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Simulate a delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const prototypeResponse: RiskAssessmentOutput = {
        riskLevel: 'Medium',
        safetyAdvice: [
          'This is a prototype response for demonstration.',
          'Always be aware of your surroundings.',
          'Stick to well-lit and populated areas.',
          'Have your phone ready in case of an emergency.',
        ],
        preferredRoute: 'Stay on Main Street and avoid the poorly lit side streets.',
        areasToAvoid: ['The alley behind the old factory.', 'The unlit park area after 9 PM.'],
      };

    return { type: "success" as const, data: prototypeResponse };
  } catch (error) {
    console.error("Risk assessment failed:", error);
    return { type: "error" as const, message: "Failed to get safety advice. Please try again." };
  }
}

const followSchema = z.object({
  movementData: z.string().min(1, "Movement data cannot be empty."),
  typicalRoute: z.string().min(1, "Typical route cannot be empty."),
});

export async function checkFollowing(prevState: any, formData: FormData) {
  try {
    const validatedFields = followSchema.safeParse({
      movementData: formData.get("movementData"),
      typicalRoute: formData.get("typicalRoute"),
    });

    if (!validatedFields.success) {
      return {
        type: "error" as const,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Simulate a delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const prototypeResponse: FollowDetectionOutput = {
        isFollowing: true,
        explanation: 'Prototype: The system detected anomalies such as unexpected stops and route deviations that match patterns of being followed.',
        suggestedActions: 'Head to a public, well-lit place. Do not go home directly. Call a trusted contact or emergency services if you feel unsafe.',
    };

    return { type: "success" as const, data: prototypeResponse };
  } catch (error) {
    console.error("Follow detection failed:", error);
    return { type: "error" as const, message: "Failed to analyze movement data. Please try again." };
  }
}


const distressSchema = z.object({
    audioDataUri: z.string().min(1, "Audio data is required."),
    transcript: z.string(),
});

export async function checkDistress(prevState: any, formData: FormData) {
    try {
        const validatedFields = distressSchema.safeParse({
            audioDataUri: formData.get('audioDataUri'),
            transcript: formData.get('transcript'),
        });

        if (!validatedFields.success) {
            return {
                type: "error" as const,
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }

        const result = await detectDistress(validatedFields.data);
        return { type: "success" as const, data: result };
    } catch (error) {
        console.error("Distress detection failed:", error);
        return { type: "error" as const, message: "Failed to analyze audio. Please try again." };
    }
}

const bodyguardSchema = z.object({
    script: z.string().min(1, "Script cannot be empty."),
});

export async function getFakeCall(prevState: any, formData: FormData) {
    try {
        const validatedFields = bodyguardSchema.safeParse({
            script: formData.get('script'),
        });

        if (!validatedFields.success) {
            return {
                type: "error" as const,
                errors: validatedFields.error.flatten().fieldErrors,
            };
        }

        const result = await generateFakeCallAudio(validatedFields.data);
        return { type: "success" as const, data: result };
    } catch (error) {
        console.error("Bodyguard audio generation failed:", error);
        return { type: "error" as const, message: "Failed to generate bodyguard audio. Please try again." };
    }
}
