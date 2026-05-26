/**
 * Health check endpoint.
 * GET /api/health → { ok: true, ts: ISO timestamp, env: 'development'|'production' }
 *
 * 셋업 검증 및 모니터링에 사용.
 */
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    env: process.env.NODE_ENV ?? 'unknown',
    name: 'musical-studio',
  });
}
