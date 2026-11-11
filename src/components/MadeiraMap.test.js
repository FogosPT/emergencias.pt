import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { madeiraOccurrences } from '../store/madeiraSlice.js';
import MadeiraMap from './MadeiraMap.js';

const makeStore = () => configureStore({
    reducer: { madeiraOccurrences: madeiraOccurrences.slice.reducer },
});

const renderMap = () => render(
    <Provider store={makeStore()}>
        <MemoryRouter>
            <MadeiraMap />
        </MemoryRouter>
    </Provider>
);

const base = { nature: 'Queda de Árvore', firefighters: 2, vehicles: 1, entities: ['CMOS'], start: '2026-11-11T11:00:00Z' };

describe('<MadeiraMap />', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                success: true,
                data: [
                    { ...base, id: '1', parishCode: '310307', parish: 'São Martinho', municipality: 'Funchal', lat: 32.64, lng: -16.94, location: 'parish' },
                    { ...base, id: '2', parishCode: '310307', parish: 'São Martinho', municipality: 'Funchal', lat: 32.64, lng: -16.94, location: 'parish', copies: 2 },
                    { ...base, id: '3', parishCode: '310403', parish: 'Machico', municipality: 'Machico', lat: 32.71, lng: -16.76, location: 'parish' },
                    // no coordinates yet (fogosapi without lat/lng): not on the map
                    { ...base, id: '4', parishCode: null, parish: null, municipality: null },
                ],
            }),
        });
    });

    it('renders one marker per parish with the summed count and the approximate-location note', async () => {
        const { container } = renderMap();
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/v2/madeira/occurrences');
            expect(container.querySelectorAll('.parish-pin')).toHaveLength(2);
        });
        const counts = [...container.querySelectorAll('.parish-pin-count')].map((n) => n.textContent);
        expect(counts).toEqual(['3', '1']);
        expect(screen.getByTitle('São Martinho, Funchal: 3 ocorrências')).toBeInTheDocument();
        expect(screen.getByRole('note')).toHaveTextContent(/Localização aproximada \(freguesia\)/);
        expect(screen.getByRole('note')).toHaveTextContent(/1 sem localização/);
        expect(screen.getByText('Fonte: SRPC, IP-RAM (via Fogos.pt)')).toBeInTheDocument();
    });
});
