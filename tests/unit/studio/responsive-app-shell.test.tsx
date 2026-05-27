import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ResponsiveAppShell } from '@/features/studio/ResponsiveAppShell';

describe('ResponsiveAppShell', () => {
  it('renders left navigation and page content', () => {
    render(
      <ResponsiveAppShell activeHref="/work">
        <h1>Work surface</h1>
      </ResponsiveAppShell>,
    );

    expect(screen.getAllByText('Musical Studio').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/work');
    expect(screen.getByRole('heading', { name: 'Work surface' })).toBeInTheDocument();
  });

  it('opens and closes the mobile drawer navigation', async () => {
    render(
      <ResponsiveAppShell activeHref="/">
        <h1>Dashboard</h1>
      </ResponsiveAppShell>,
    );

    await userEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));
    expect(screen.getByRole('dialog', { name: '모바일 메뉴' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '메뉴 닫기' }));
    expect(screen.queryByRole('dialog', { name: '모바일 메뉴' })).not.toBeInTheDocument();
  });
});
