import { config } from 'dotenv';
config();

import '@/ai/flows/follow-detection.ts';
import '@/ai/flows/distress-detection.ts';
import '@/ai/flows/risk-assessment.ts';