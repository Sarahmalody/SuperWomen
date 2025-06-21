// src/app/actions.ts
"use server";

import { z } from "zod";
import { getSafetyAdvice } from "@/ai/flows/risk-assessment";
import { detectFollowing } from "@/ai/flows/follow-detection";
import { detectDistress } from "@/ai/flows/distress-detection";

const riskSchema = z.object({
  locationDescription: z.string().min(10, "Please provide a more detailed description."),
});

export async function assessRisk(prevState: any, formData: FormData) {
  try {
    const validatedFields = riskSchema.safeParse({
      locationDescription: formData.get("locationDescription"),
    });

    if (!validatedFields.success) {
      return {
        type: "error" as const,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const result = await getSafetyAdvice({
      locationDescription: validatedFields.data.locationDescription,
    });
    return { type: "success" as const, data: result };
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

    const result = await detectFollowing(validatedFields.data);
    return { type: "success" as const, data: result };
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
