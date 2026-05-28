import { Redis } from "bullmq";
import { env } from "./env";

function getRedisOptions() {
  const url = env.REDIS_URL;
  const isTLS = url.startsWith("rediss://");
  
  return {
    maxRetriesPerRequest: null as null,
    enableReadyCheck: false,
    tls: isTLS ? { rejectUnauthorized: false } : undefined,
    retryStrategy(times: number) {
      if (times > 5) return null;
      return Math.min(times * 1000, 5000);
    },
    lazyConnect: false,
    keepAlive: 10000,
    connectTimeout: 15000,
  };
}

// BullMQ's own Redis — no conflict
export const redis = new Redis(env.REDIS_URL, getRedisOptions());

// Cache Redis — separate instance
export const redisCache = new Redis(env.REDIS_URL, {
  ...getRedisOptions(),
  maxRetriesPerRequest: 3 as unknown as null,
});

redis.on("connect", () => console.log("✅ Redis (BullMQ) connected"));
redis.on("error", (err: Error) => {
  if (!err.message.includes("ECONNRESET") &&
      !err.message.includes("Command timed out") &&
      !err.message.includes("MaxRetries")) {
    console.error("❌ Redis error:", err.message);
  }
});

redisCache.on("connect", () => console.log("✅ Redis (cache) connected"));
redisCache.on("error", (err: Error) => {
  if (!err.message.includes("ECONNRESET") &&
      !err.message.includes("Command timed out") &&
      !err.message.includes("MaxRetries")) {
    console.error("❌ Redis cache error:", err.message);
  }
});