import { NextResponse } from 'next/server';
import { prisma } from '@waypoint/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = 'disconnected';
  let optimizerStatus = 'unreachable';

  // Check PostgreSQL Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  // Check Python Allocation Optimizer Microservice
  try {
    const optimizerUrl = process.env.OPTIMIZER_URL || 'http://127.0.0.1:8000';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${optimizerUrl}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      optimizerStatus = 'healthy';
    }
  } catch {
    optimizerStatus = 'offline';
  }

  const isHealthy = dbStatus === 'connected';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'waypoint-web',
      version: '1.0.0',
      timestamp,
      checks: {
        database: dbStatus,
        optimizer: optimizerStatus,
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
