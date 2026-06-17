import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WorkspaceSurface } from '@/components/studio/WorkspaceSurface';

describe('WorkspaceSurface', () => {
  it('wires Work controls to the shared interaction reducer', async () => {
    render(<WorkspaceSurface view="work" />);

    await userEvent.click(screen.getByRole('button', { name: 'Se-hun' }));

    expect(screen.getByRole('status')).toHaveTextContent('Se-hun');
  });

  it('renders Google Drive as a real sidebar destination', () => {
    render(<WorkspaceSurface view="drive" />);

    expect(screen.getByRole('heading', { name: /Google Drive/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Drive/ })).toBeInTheDocument();
  });
});
