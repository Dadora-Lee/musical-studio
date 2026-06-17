import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('scripts/sync-env.sh', () => {
  it('writes shell-safe .env.local values when secrets contain special characters', () => {
    const root = mkdtempSync(join(tmpdir(), 'musical-studio-env-'));
    mkdirSync(join(root, '.env'));
    mkdirSync(join(root, 'scripts'));

    const scriptPath = resolve('scripts/sync-env.sh');
    copyFileSync(scriptPath, join(root, 'scripts/sync-env.sh'));
    chmodSync(join(root, 'scripts/sync-env.sh'), 0o755);

    const secretValue = 'a b$7`n?btaC';
    const secrets = [
      'NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=anon',
      'SUPABASE_SERVICE_ROLE_KEY=service',
      'SUPABASE_JWT_SECRET=jwt',
      `SUPABASE_DB_PASSWORD=${secretValue}`,
      'SUPABASE_PROJECT_REF=project',
      'DATABASE_URL=postgres://example',
      'GOOGLE_CLIENT_ID=client',
      'GOOGLE_CLIENT_SECRET=secret',
      'GOOGLE_OAUTH_JSON_PATH=.env/client_secret.json',
      'NEXT_PUBLIC_APP_URL=http://localhost:3000',
      'NEXTAUTH_SECRET=nextauth',
      'DEV_ACCESS_TOKEN=devtoken',
    ].join('\n');

    execFileSync('bash', ['-lc', `cat > ${join(root, '.env/secrets.env')} <<'EOF'\n${secrets}\nEOF`]);
    execFileSync('bash', ['scripts/sync-env.sh'], { cwd: root });

    const generated = readFileSync(join(root, '.env.local'), 'utf8');
    expect(generated).toContain('SUPABASE_DB_PASSWORD=');

    const output = execFileSync(
      'bash',
      ['-lc', '. ./.env.local && printf "%s" "$SUPABASE_DB_PASSWORD"'],
      { cwd: root, encoding: 'utf8' },
    );
    expect(output).toBe(secretValue);
  });
});
