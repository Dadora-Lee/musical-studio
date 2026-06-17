import { execFileSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('scripts/verify-local-db.sh', () => {
  it('resets local Supabase and verifies prototype tables, rows, and casting name', () => {
    const root = mkdtempSync(join(tmpdir(), 'musical-studio-verify-db-'));
    const binDir = join(root, 'bin');

    mkdirSync(join(root, 'scripts'));
    mkdirSync(binDir);

    copyFileSync(resolve('scripts/verify-local-db.sh'), join(root, 'scripts/verify-local-db.sh'));
    chmodSync(join(root, 'scripts/verify-local-db.sh'), 0o755);

    writeFileSync(join(root, 'scripts/supabase-local.sh'), '#!/usr/bin/env bash\necho "reset=$*"\n');
    chmodSync(join(root, 'scripts/supabase-local.sh'), 0o755);

    writeDockerStub(binDir);

    const output = execFileSync('bash', ['scripts/verify-local-db.sh'], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ''}`,
      },
    });

    expect(output).toContain('[OK] local Supabase stack is running');
    expect(output).toContain('reset=db reset');
    expect(output).toContain('[OK] table exists: public.numbers');
    expect(output).toContain('[OK] public.comments rows: 2');
    expect(output).toContain('[OK] take_03.wav links to submitted casting: 히카루');
  });

  it('can verify an already-running local Supabase stack without resetting', () => {
    const root = mkdtempSync(join(tmpdir(), 'musical-studio-verify-db-'));
    const binDir = join(root, 'bin');

    mkdirSync(join(root, 'scripts'));
    mkdirSync(binDir);

    copyFileSync(resolve('scripts/verify-local-db.sh'), join(root, 'scripts/verify-local-db.sh'));
    chmodSync(join(root, 'scripts/verify-local-db.sh'), 0o755);
    writeFileSync(join(root, 'scripts/supabase-local.sh'), '#!/usr/bin/env bash\nexit 7\n');
    chmodSync(join(root, 'scripts/supabase-local.sh'), 0o755);
    writeDockerStub(binDir);

    const output = execFileSync('bash', ['scripts/verify-local-db.sh'], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH ?? ''}`,
        SKIP_SUPABASE_RESET: '1',
      },
    });

    expect(output).toContain('[OK] using existing local Supabase stack');
    expect(output).toContain('[OK] local prototype DB verification passed');
  });
});

function writeDockerStub(binDir: string) {
  writeFileSync(
    join(binDir, 'docker'),
    [
      '#!/usr/bin/env bash',
      'sql="${*: -1}"',
      'case "$sql" in',
      '  *to_regclass*) echo t ;;',
      '  *"count(*) from public.numbers"*) echo 22 ;;',
      '  *"count(*) from public.members"*) echo 21 ;;',
      '  *"count(*) from public.works"*) echo 2 ;;',
      '  *"count(*) from public.comments"*) echo 2 ;;',
      '  *"casting_name from public.works"*) echo 히카루 ;;',
      '  *) echo "unexpected sql: $sql" >&2; exit 9 ;;',
      'esac',
    ].join('\n'),
  );
  chmodSync(join(binDir, 'docker'), 0o755);
}
