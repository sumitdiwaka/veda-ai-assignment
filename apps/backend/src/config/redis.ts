import Redis from "ioredis";
import { env } from "./env";

// Parse URL to add proper TLS options for Upstash
function createRedisConnection(maxRetries: number | null) {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: maxRetries,
    enableReadyCheck: false,
    tls: env.REDIS_URL.startsWith("rediss://") ? {
      rejectUnauthorized: false,
    } : undefined,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 1000, 5000);
    },
    reconnectOnError(err) {
      return err.message.includes("ECONNRESET");
    },
    lazyConnect: false,
    keepAlive: 10000,
    connectTimeout: 15000,
    commandTimeout: 10000,
  });
}

// BullMQ requires maxRetriesPerRequest: null
export const redis = createRedisConnection(null);

// Cache Redis — normal
export const redisCache = createRedisConnection(3);

redis.on("connect", () => console.log("✅ Redis (BullMQ) connected"));
redis.on("error", (err) => {
  if (!err.message.includes("ECONNRESET") && !err.message.includes("MaxRetries")) {
    console.error("❌ Redis error:", err.message);
  }
});

redisCache.on("connect", () => console.log("✅ Redis (cache) connected"));
redisCache.on("error", (err) => {
  if (!err.message.includes("ECONNRESET") && !err.message.includes("MaxRetries")) {
    console.error("❌ Redis cache error:", err.message);
  }
});