/**
 * 테스트 fixture loader.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FIXTURES_DIR = resolve(__dirname, '..', 'fixtures');

export function readFixture(relativePath: string): string {
  return readFileSync(resolve(FIXTURES_DIR, relativePath), 'utf-8');
}

export function readFixtureBuffer(relativePath: string): Buffer {
  return readFileSync(resolve(FIXTURES_DIR, relativePath));
}
