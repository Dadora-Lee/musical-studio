import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AuthContext } from '@/lib/domain/access-control';

export const DEV_ADMIN_COOKIE = 'ms-dev-admin';

const DEFAULT_TTL_SECONDS = 60 * 60 * 2;

function getPassword() {
  return process.env.DEV_ADMIN_PASSWORD ?? '';
}

export function getDevAdminTtlSeconds() {
  const ttl = Number(process.env.DEV_ADMIN_TTL_SECONDS ?? DEFAULT_TTL_SECONDS);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_TTL_SECONDS;
}

export function isDevAdminUnlockConfigured() {
  return getPassword().length > 0 && isDevAdminAllowedInCurrentEnvironment();
}

export function verifyDevAdminPassword(password: string) {
  const expected = getPassword();
  if (!expected || !password) return false;
  return safeEqual(password, expected);
}

export function createDevAdminToken(now = new Date()) {
  const password = getPassword();
  if (!password) throw new Error('DEV_ADMIN_PASSWORD is required.');

  const expiresAt = now.getTime() + getDevAdminTtlSeconds() * 1000;
  const payload = `dev-admin.${expiresAt}`;
  return `${payload}.${sign(payload, password)}`;
}

export function verifyDevAdminToken(token: string | undefined, now = new Date()) {
  const password = getPassword();
  if (!password || !token || !isDevAdminAllowedInCurrentEnvironment()) return false;

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'dev-admin') return false;

  const payload = `${parts[0]}.${parts[1]}`;
  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt <= now.getTime()) return false;

  return safeEqual(parts[2], sign(payload, password));
}

export function buildDevAdminAuthContext(): AuthContext {
  return {
    state: 'active',
    user: {
      id: 'dev-admin',
      email: 'dev-admin@local',
      name: 'Temporary Admin',
    },
    profile: {
      id: 'dev-admin',
      authUserId: 'dev-admin',
      email: 'dev-admin@local',
      displayName: 'Temporary Admin',
      appRole: 'admin',
      status: 'active',
      roleNames: ['Hikaru', 'Se-hun', 'Ensemble'],
      primaryRole: 'Hikaru',
    },
  };
}

function sign(payload: string, password: string) {
  return createHmac('sha256', password).update(payload).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}


function isDevAdminAllowedInCurrentEnvironment() {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEV_ADMIN_UNLOCK === 'true';
}
