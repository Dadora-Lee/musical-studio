import { execFileSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('scripts/supabase-local.sh', () => {
  it('runs the Supabase CLI from a clean workdir with local env loaded', () => {
    const root = mkdtempProject();
    const workdir = join(root, 'local-workdir');

    mkdirSync(join(root, 'scripts'));
    mkdirSync(join(root, 'supabase'));
    mkdirSync(join(root, 'node_modules/.bin'), { recursive: true });

    copyFileSync(resolve('scripts/supabase-local.sh'), join(root, 'scripts/supabase-local.sh'));
    chmodSync(join(root, 'scripts/supabase-local.sh'), 0o755);
    writeFileSync(join(root, '.env.local'), "GOOGLE_CLIENT_ID='local-client'\n");

    const fakeSupabase = [
      '#!/usr/bin/env bash',
      'printf "pwd=%s\\n" "$PWD"',
      'printf "args=%s\\n" "$*"',
      'printf "google=%s\\n" "$GOOGLE_CLIENT_ID"',
    ].join('\n');
    writeFileSync(join(root, 'node_modules/.bin/supabase'), fakeSupabase);
    chmodSync(join(root, 'node_modules/.bin/supabase'), 0o755);

    const output = execFileSync('bash', ['scripts/supabase-local.sh', 'db', 'reset'], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        SUPABASE_LOCAL_WORKDIR: workdir,
      },
    });

    expect(output).toContain(`pwd=${workdir}`);
    expect(output).toContain('args=db reset');
    expect(output).toContain('google=local-client');
  });
});

function mkdtempProject() {
  return mkdtempSync(join(tmpdir(), 'musical-studio-supabase-'));
}
