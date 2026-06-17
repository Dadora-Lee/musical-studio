import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DocsPage from '@/app/docs/page';

describe('Project handoff summary page', () => {
  it('reflects the current implementation instead of stale bootstrap notes', () => {
    render(<DocsPage />);

    expect(screen.getByRole('heading', { name: 'Project Handoff Summary' })).toBeInTheDocument();
    expect(screen.queryByText(/docs\/project-handoff\.md/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Next\.js 14/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Shadcn UI/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Wavesurfer\.js/)).not.toBeInTheDocument();

    expect(screen.getAllByText(/Next\.js 16\.2\.6/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/React 19\.2\.4/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DEV_ADMIN_PASSWORD/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/pnpm typecheck/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/docs\/agent-handoff\/open\/2026-05-27-session-end-to-next\.md/).length).toBeGreaterThan(0);
  });

  it('shows a Korean copy of the handoff content for local collaborators', () => {
    render(<DocsPage />);

    expect(screen.getByRole('heading', { name: '한국어 인수인계 요약' })).toBeInTheDocument();
    expect(screen.getByText(/현재 구현 메모/)).toBeInTheDocument();
    expect(screen.getByText(/구현된 기술 스택과 라우트/)).toBeInTheDocument();
    expect(screen.getByText(/인수인계 참고 문서/)).toBeInTheDocument();
    expect(screen.getByText(/로그인 화면은 로그인되지 않았을 때 보이는 화면/)).toBeInTheDocument();
    expect(screen.getByText(/개발용 관리자 흐름은 로컬 검증 전용/)).toBeInTheDocument();
  });
});