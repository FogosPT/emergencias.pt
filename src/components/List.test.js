import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { allIncidents, fmaIncidents } from '../store/incidentsSlice.js';
import sideBar from '../store/sidebarSlice.js';
import List from './List.js';

const makeStore = () => configureStore({
    reducer: {
        allIncidents: allIncidents.slice.reducer,
        fmaIncidents: fmaIncidents.slice.reducer,
        sideBar,
    },
});

const renderList = () => render(
    <Provider store={makeStore()}>
        <MemoryRouter>
            <List />
        </MemoryRouter>
    </Provider>
);

describe('<List />', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        });
    });

    it('renders headers and hits the /api endpoint', async () => {
        renderList();
        expect(screen.getByRole('button', { name: 'Estado' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Distrito' })).toBeInTheDocument();
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/v2/incidents/active?all=1');
        });
    });

    it('shows an empty-state row when the API returns no incidents', async () => {
        renderList();
        await waitFor(() => {
            expect(screen.getByText(/Sem ocorrências/i)).toBeInTheDocument();
        });
    });

    it('renders totals for fetched incidents', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                data: [
                    { id: 1, man: 5, terrain: 2, aerial: 1, meios_aquaticos: 0, district: 'Faro', concelho: 'Loulé' },
                    { id: 2, man: 3, terrain: 1, aerial: 0, meios_aquaticos: 2, district: 'Faro', concelho: 'Faro' },
                ],
            }),
        });
        renderList();
        await waitFor(() => {
            expect(screen.getByText('Total Ocorrências')).toBeInTheDocument();
            // 5 + 3 = 8 firefighters
            expect(screen.getByText('8')).toBeInTheDocument();
        });
    });
});
