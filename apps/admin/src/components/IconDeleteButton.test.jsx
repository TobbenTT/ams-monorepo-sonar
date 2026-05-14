import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IconDeleteButton from './IconDeleteButton';

describe('IconDeleteButton', () => {
    it('renders with title for accessibility', () => {
        render(<IconDeleteButton onClick={() => {}} title="Eliminar material" />);
        expect(screen.getByRole('button', { name: 'Eliminar material' })).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handler = vi.fn();
        render(<IconDeleteButton onClick={handler} title="Eliminar" />);
        fireEvent.click(screen.getByRole('button'));
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('respects disabled state', () => {
        const handler = vi.fn();
        render(<IconDeleteButton onClick={handler} title="Eliminar" disabled />);
        const btn = screen.getByRole('button');
        expect(btn).toBeDisabled();
        fireEvent.click(btn);
        expect(handler).not.toHaveBeenCalled();
    });

    it('SF-604 BUG-13: minimum touch target 24x24 — md size', () => {
        const { container } = render(<IconDeleteButton onClick={() => {}} title="Eliminar" />);
        const btn = container.querySelector('button');
        // Default size is md (w-6 h-6 = 24x24)
        expect(btn.className).toContain('w-6');
        expect(btn.className).toContain('h-6');
    });

    it('supports size variants sm/md/lg', () => {
        const { container, rerender } = render(<IconDeleteButton onClick={() => {}} title="x" size="sm" />);
        expect(container.querySelector('button').className).toContain('w-5');
        rerender(<IconDeleteButton onClick={() => {}} title="x" size="lg" />);
        expect(container.querySelector('button').className).toContain('w-8');
    });
});
