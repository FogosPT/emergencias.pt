import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { madeiraOccurrences, madeiraEvent } from '../store/madeiraSlice.js';
import Madeira from './Madeira.js';

const makeStore = () => configureStore({
    reducer: {
        madeiraOccurrences: madeiraOccurrences.slice.reducer,
        madeiraEvent: madeiraEvent.slice.reducer,
    },
});

const renderPage = (store = makeStore()) => render(
    <Provider store={store}>
        <MemoryRouter>
            <Madeira />
        </MemoryRouter>
    </Provider>
);

const EVENT = {
    id: 'e1',
    title: 'Depressão Charles – Precipitação e vento forte',
    zone: 'Madeira e Porto Santo',
    status: 'ATIVO',
    active: true,
    start: '2026-11-10T20:00:00Z',
    end: '2026-11-11T12:15:00Z',
    untilNow: true,
    updatedAt: '2026-11-11T12:15:00Z',
    kpi: { occurrences: 265, activeOccurrences: 20, operationals: 668, groundAssets: 274, municipalities: 12, peak: { time: '2026-11-11T06:00:00Z', occurrences: 36 } },
    summary: 'Desde 10/11 20:00 registaram-se 265 ocorrências.',
    recommendations: ['Evite deslocações desnecessárias.'],
    municipalities: [{ name: 'Funchal', occurrences: 65, operationals: 150, groundAssets: 60, natures: [{ code: '3313', description: 'Movimento de massa', occurrences: 20 }] }],
    roadRestrictions: [{ road: 'ER101', closed: true, text: 'Derrocada ao km 3', time: null }],
    communiques: [{ title: 'Aviso 17/2026', time: '2026-11-06T11:31:00Z', text: 'Agravamento…', link: 'https://www.procivmadeira.pt/x.html', official: true }],
    notes: 'Dados provisórios.',
};

const OCCURRENCES = [
    { id: 'a', copies: 1, start: '2026-11-11T11:59:00Z', natureCode: '3301', nature: 'Queda de Árvore', firefighters: 2, vehicles: 1, parish: 'São Martinho', municipality: 'Funchal', entities: ['CMOS'] },
    { id: 'b', copies: 2, start: '2026-11-11T09:30:00Z', natureCode: '3313', nature: 'Movimento de massa', firefighters: 3, vehicles: 1, parish: 'Machico', municipality: 'Machico', entities: ['BVM'] },
    { id: 'c', copies: 1, start: '2026-11-11T08:00:00Z', natureCode: '4305', nature: 'Limpeza de Via', firefighters: 0, vehicles: 0, parish: null, municipality: null, entities: [] },
];

const mockApi = ({ event = null, occurrences = [] } = {}) => {
    global.fetch = vi.fn((url) => Promise.resolve({
        ok: true,
        json: async () => (url.includes('/events/current')
            ? { success: true, data: event }
            : { success: true, data: occurrences }),
    }));
};

describe('<Madeira />', () => {
    beforeEach(() => mockApi());

    it('hits both relative /api endpoints and shows the empty states', async () => {
        renderPage();
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/v2/madeira/events/current');
            expect(global.fetch).toHaveBeenCalledWith('/api/v2/madeira/occurrences');
        });
        expect(await screen.findByText(/Sem evento de tempo adverso ativo/)).toBeInTheDocument();
        expect(screen.getByText(/Sem ocorrências nas últimas 24 horas/)).toBeInTheDocument();
        expect(screen.getByText(/Fonte: SRPC, IP-RAM \(via Fogos\.pt\)/)).toBeInTheDocument();
    });

    it('renders the active event summary', async () => {
        mockApi({ event: EVENT });
        renderPage();
        expect(await screen.findByRole('heading', { name: EVENT.title })).toBeInTheDocument();
        expect(screen.getByText('265')).toBeInTheDocument();
        expect(screen.getByText('668')).toBeInTheDocument();
        // 06:00Z = 06:00 in Madeira in November (WET, UTC+0)
        expect(screen.getByText(/Pico: 36 ocorrências às 06:00/)).toBeInTheDocument();
        expect(screen.getByText('Cortada')).toBeInTheDocument();
        expect(screen.getByText('ER101')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ler comunicado' })).toHaveAttribute('href', 'https://www.procivmadeira.pt/x.html');
        expect(screen.getByText('Evite deslocações desnecessárias.')).toBeInTheDocument();
        expect(screen.getByText(/Movimento de massa \(20\)/)).toBeInTheDocument();
    });

    it('lists occurrences with local time, totals (copies counted) and sorting', async () => {
        mockApi({ occurrences: OCCURRENCES });
        const user = userEvent.setup();
        renderPage();
        expect(await screen.findByText('Queda de Árvore')).toBeInTheDocument();
        expect(screen.getByText('São Martinho')).toBeInTheDocument();
        expect(screen.getByText('×2')).toBeInTheDocument();
        expect(screen.getByText('11/11, 11:59')).toBeInTheDocument();
        // 1 + 2 + 1 occurrences; 2 + 3*2 + 0 firefighters
        const ocCard = screen.getByText('Ocorrências').parentElement;
        expect(within(ocCard).getByText('4')).toBeInTheDocument();
        const ffCard = screen.getByText('Operacionais').parentElement;
        expect(within(ffCard).getByText('8')).toBeInTheDocument();

        const firstNature = () => screen.getAllByRole('row')[1].textContent;
        expect(firstNature()).toMatch(/Queda de Árvore/);
        await user.click(screen.getByRole('button', { name: 'Início' }));
        expect(firstNature()).toMatch(/Limpeza de Via/);
    });

    it('filters by concelho', async () => {
        mockApi({ occurrences: OCCURRENCES });
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Queda de Árvore');
        await user.selectOptions(screen.getByLabelText('Concelho'), 'Machico');
        expect(screen.queryByText('Queda de Árvore')).not.toBeInTheDocument();
        expect(screen.getByText('Movimento de massa')).toBeInTheDocument();
    });

    it('shows an error row when the occurrences request fails', async () => {
        global.fetch = vi.fn((url) => Promise.resolve(url.includes('/occurrences')
            ? { ok: false, status: 500, json: async () => ({}) }
            : { ok: true, json: async () => ({ data: null }) }));
        renderPage();
        expect(await screen.findByText(/HTTP 500/)).toBeInTheDocument();
    });

    it('keeps the cached event but shows the error when a refresh fails', async () => {
        mockApi({ event: EVENT, occurrences: OCCURRENCES });
        const store = makeStore();
        renderPage(store);
        expect(await screen.findByRole('heading', { name: EVENT.title })).toBeInTheDocument();

        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
        await act(() => store.dispatch(madeiraEvent.fetchThunk()));

        expect(screen.getByRole('heading', { name: EVENT.title })).toBeInTheDocument();
        expect(screen.getByText(/Não foi possível atualizar o evento ativo: HTTP 503/)).toBeInTheDocument();
    });

    it('marks cached occurrences as stale when a refresh fails', async () => {
        mockApi({ occurrences: OCCURRENCES });
        const store = makeStore();
        renderPage(store);
        expect(await screen.findByText('Queda de Árvore')).toBeInTheDocument();

        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
        await act(() => store.dispatch(madeiraOccurrences.fetchThunk()));

        expect(screen.getByText('Queda de Árvore')).toBeInTheDocument();
        expect(screen.getByText(/Não foi possível atualizar as ocorrências: HTTP 503\. A mostrar os últimos dados obtidos/)).toBeInTheDocument();
    });
});
