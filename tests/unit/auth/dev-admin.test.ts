import { describe, expect, it, vi } from 'vitest';
import {
  buildDevAdminAuthContext,
  createDevAdminToken,
  verifyDevAdminPassword,
  verifyDevAdminToken,
} from '@/lib/auth/dev-admin';

describe('dev admin unlock', () => {
  it('accepts only the configured temporary admin password', () => {
    vi.stubEnv('DEV_ADMIN_PASSWORD', 'local-admin-pass');

    expect(verifyDevAdminPassword('local-admin-pass')).toBe(true);
    expect(verifyDevAdminPassword('wrong-pass')).toBe(false);
  });

  it('creates a signed short-lived token that can be verified', () => {
    vi.stubEnv('DEV_ADMIN_PASSWORD', 'local-admin-pass');
    vi.stubEnv('DEV_ADMIN_TTL_SECONDS', '7200');

    const token = createDevAdminToken(new Date('2026-05-27T00:00:00.000Z'));

    expect(verifyDevAdminToken(token, new Date('2026-05-27T01:59:59.000Z'))).toBe(true);
    expect(verifyDevAdminToken(`${token}tampered`, new Date('2026-05-27T01:00:00.000Z'))).toBe(false);
    expect(verifyDevAdminToken(token, new Date('2026-05-27T02:00:01.000Z'))).toBe(false);
  });

  it('stays disabled in production unless explicitly enabled', () => {
    vi.stubEnv('DEV_ADMIN_PASSWORD', 'local-admin-pass');
    vi.stubEnv('NODE_ENV', 'production');

    const token = createDevAdminToken(new Date('2026-05-27T00:00:00.000Z'));

    expect(verifyDevAdminToken(token, new Date('2026-05-27T00:01:00.000Z'))).toBe(false);

    vi.stubEnv('ENABLE_DEV_ADMIN_UNLOCK', 'true');

    expect(verifyDevAdminToken(token, new Date('2026-05-27T00:01:00.000Z'))).toBe(true);
  });

  it('builds an active admin auth context for the temporary unlock session', () => {
    const context = buildDevAdminAuthContext();

    expect(context.state).toBe('active');
    expect(context.profile?.appRole).toBe('admin');
    expect(context.profile?.email).toBe('dev-admin@local');
  });
});
