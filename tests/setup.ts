/**
 * Vitest 글로벌 셋업.
 * @testing-library/jest-dom matchers + 공통 mock.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
