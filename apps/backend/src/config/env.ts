import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  MAX_FILE_SIZE_MB: z.string().default("10"),
  UPLOAD_DIR: z.string().default("uploads"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;