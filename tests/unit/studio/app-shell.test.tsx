import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from '@/components/studio/AppShell';
import { buildDevAdminAuthContext } from '@/lib/auth/dev-admin';

describe('AppShell sidebar navigation', () => {
  it('links every sidebar item to a concrete route instead of duplicate placeholders', () => {
    render(
      <AppShell active="Dashboard" authContext={buildDevAdminAuthContext()}>
        <h1>Dashboard</h1>
      </AppShell>,
    );

    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Work/ })).toHaveAttribute('href', '/work');
    expect(screen.getByRole('link', { name: /Assignments/ })).toHaveAttribute('href', '/assignments');
    expect(screen.getByRole('link', { name: /Comments/ })).toHaveAttribute('href', '/comments');
    expect(screen.getByRole('link', { name: /Google Drive/ })).toHaveAttribute('href', '/drive');
    expect(screen.getByRole('link', { name: /Director/ })).toHaveAttribute('href', '/director');
    expect(screen.getByRole('link', { name: /Admin/ })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: /Settings/ })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('link', { name: /Dev Harness/ })).toHaveAttribute('href', '/dev/harness');
  });
});
