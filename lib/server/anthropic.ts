import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";

export { MODEL_ID } from "@/lib/shared/model";

export const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
