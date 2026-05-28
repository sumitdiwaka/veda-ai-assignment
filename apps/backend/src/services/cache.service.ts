import { redisCache } from "../config/redis";

const PAPER_TTL = 60 * 60 * 24;
const ASSIGNMENT_TTL = 60 * 60;
const JOB_TTL = 60 * 60 * 2;

async function safeGet(key: string): Promise<string | null> {
  try {
    return await Promise.race([
      redisCache.get(key),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
  } catch { return null; }
}

async function safeSet(key: string, ttl: number, value: string): Promise<void> {
  try {
    await Promise.race([
      redisCache.setex(key, ttl, value),
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]);
  } catch { /* silently ignore */ }
}

async function safeDel(key: string): Promise<void> {
  try {
    await Promise.race([
      redisCache.del(key),
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ]);
  } catch { /* silently ignore */ }
}

export async function cachePaper(paperId: string, data: object): Promise<void> {
  await safeSet(`paper:${paperId}`, PAPER_TTL, JSON.stringify(data));
}

export async function getCachedPaper(paperId: string): Promise<object | null> {
  const cached = await safeGet(`paper:${paperId}`);
  return cached ? JSON.parse(cached) : null;
}

export async function cacheAssignment(assignmentId: string, data: object): Promise<void> {
  await safeSet(`assignment:${assignmentId}`, ASSIGNMENT_TTL, JSON.stringify(data));
}

export async function getCachedAssignment(assignmentId: string): Promise<object | null> {
  const cached = await safeGet(`assignment:${assignmentId}`);
  return cached ? JSON.parse(cached) : null;
}

export async function invalidateAssignmentCache(assignmentId: string): Promise<void> {
  await safeDel(`assignment:${assignmentId}`);
}

export async function invalidatePaperCache(paperId: string): Promise<void> {
  await safeDel(`paper:${paperId}`);
}

export async function setJobStatus(jobId: string, status: string, meta?: object): Promise<void> {
  await safeSet(
    `job:${jobId}`,
    JOB_TTL,
    JSON.stringify({ status, ...meta, updatedAt: new Date().toISOString() })
  );
}

export async function getJobStatus(jobId: string): Promise<object | null> {
  const data = await safeGet(`job:${jobId}`);
  return data ? JSON.parse(data) : null;
}