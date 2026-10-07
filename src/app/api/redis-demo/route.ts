import Redis from "ioredis";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const globalForRedis = globalThis as unknown as { redis?: Redis };

const redis =
  globalForRedis.redis ??
  new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });

globalForRedis.redis = redis;

export async function GET() {
  try {
    const visits = await redis.incr("studynotion:visits");
    await redis.set("studynotion:last_visit", new Date().toISOString());
    const lastVisit = await redis.get("studynotion:last_visit");
    return NextResponse.json({ ok: true, visits, lastVisit });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
