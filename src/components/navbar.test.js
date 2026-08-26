import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './navbar.js';

const renderNav = () => render(
    <MemoryRouter>
        <NavBar />
    </MemoryRouter>
);

describe('NavBar', () => {
    it('shows the brand and desktop links', () => {
        renderNav();
        expect(screen.getByText('Emergencias.pt')).toBeInTheDocument();
        // desktop links (multiple copies OK: one desktop, one mobile-hidden)
        expect(screen.getAllByRole('link', { name: 'Lista' }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('link', { name: 'Mapa FMA' }).length).toBeGreaterThan(0);
    });

    it('toggles the mobile menu on button click', async () => {
        const user = userEvent.setup();
        renderNav();
        const button = screen.getByRole('button', { name: /menu/i });
        expect(button).toHaveAttribute('aria-expanded', 'false');
        await user.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'true');
        await user.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });
});
