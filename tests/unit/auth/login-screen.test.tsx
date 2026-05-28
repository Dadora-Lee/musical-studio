import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginScreen } from '@/features/auth/LoginScreen';

const signInWithOAuth = vi.fn();

vi.mock('@/lib/supabase/browser', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithOAuth,
    },
  }),
}));

function googleButtonAt(index: number) {
  const buttons = screen.getAllByRole('button').filter((button) => button.textContent?.includes('Google'));
  const button = buttons.at(index);
  if (!button) {
    throw new Error(`Expected Google button at index ${index}`);
  }
  return button;
}

describe('LoginScreen', () => {
  it('shows the original signed-out app shell login entry point', () => {
    render(<LoginScreen />);

    expect(screen.getAllByText('Musical Studio').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Google Drive/).length).toBeGreaterThan(0);
    expect(googleButtonAt(0)).toBeInTheDocument();
  });

  it('starts Google OAuth from the original login modal', async () => {
    signInWithOAuth.mockResolvedValue({ error: null });

    render(<LoginScreen />);
    await userEvent.click(googleButtonAt(0));
    await userEvent.click(googleButtonAt(-1));

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        scopes: 'openid email profile',
      },
    });
  });

  it('keeps the temporary admin unlock available from the signed-out login surface', async () => {
    render(<LoginScreen />);

    expect(screen.getByRole('button', { name: '임시 관리자 로그인' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '임시 관리자 로그인' }));

    expect(screen.getByRole('heading', { name: '임시 관리자 로그인' })).toBeInTheDocument();
    expect(screen.getByLabelText('관리자 비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '관리자로 계속' })).toBeInTheDocument();
  });
});