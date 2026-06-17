import { NextResponse } from 'next/server';
import {
  DEV_ADMIN_COOKIE,
  createDevAdminToken,
  getDevAdminTtlSeconds,
  isDevAdminUnlockConfigured,
  verifyDevAdminPassword,
} from '@/lib/auth/dev-admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isDevAdminUnlockConfigured()) {
    return NextResponse.json({ ok: false, message: 'Temporary admin unlock is not configured.' }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!verifyDevAdminPassword(body?.password ?? '')) {
    return NextResponse.json({ ok: false, message: 'Invalid temporary admin password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_ADMIN_COOKIE, createDevAdminToken(), {
    httpOnly: true,
    maxAge: getDevAdminTtlSeconds(),
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEV_ADMIN_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
