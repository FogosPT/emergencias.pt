import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import {
    createMadeiraSlice,
    madeiraOccurrences,
    madeiraEvent,
    normalizeOccurrence,
    groupByParish,
    OCCURRENCES_ENDPOINT,
    EVENT_ENDPOINT,
} from './madeiraSlice.js';

const makeStore = () => configureStore({
    reducer: {
        madeiraOccurrences: madeiraOccurrences.slice.reducer,
        madeiraEvent: madeiraEvent.slice.reducer,
    },
});

const ok = (body) => ({ ok: true, json: async () => body });

describe('madeiraSlice', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it('has the expected initial state', () => {
        const store = makeStore();
        expect(store.getState().madeiraOccurrences).toEqual({ data: [], loading: false, error: null, sort: null });
        expect(store.getState().madeiraEvent).toEqual({ data: null, loading: false, error: null, sort: null });
    });

    it('fetches occurrences from the relative /api endpoint and normalises them', async () => {
        const store = makeStore();
        global.fetch.mockResolvedValue(ok({
            success: true,
            data: [{ id: 'a', copies: 2, firefighters: '3', vehicles: null, entities: ['BVC', 'CMOS'] }],
        }));
        await store.dispatch(madeiraOccurrences.fetchThunk());
        expect(global.fetch).toHaveBeenCalledWith(OCCURRENCES_ENDPOINT);
        expect(OCCURRENCES_ENDPOINT).toBe('/api/v2/madeira/occurrences');
        const [o] = store.getState().madeiraOccurrences.data;
        expect(o).toMatchObject({
            id: 'a', copies: 2, firefighters: 3, vehicles: 0,
            lat: null, lng: null, entitiesLabel: 'BVC, CMOS',
        });
    });

    it('stores the current event, or null when there is none', async () => {
        const store = makeStore();
        global.fetch.mockResolvedValueOnce(ok({ success: true, data: { id: 'e1', title: 'Depressão' } }));
        await store.dispatch(madeiraEvent.fetchThunk());
        expect(global.fetch).toHaveBeenCalledWith(EVENT_ENDPOINT);
        expect(store.getState().madeiraEvent.data).toEqual({ id: 'e1', title: 'Depressão' });

        global.fetch.mockResolvedValueOnce(ok({ success: true, data: null }));
        await store.dispatch(madeiraEvent.fetchThunk());
        expect(store.getState().madeiraEvent.data).toBe(null);
    });

    it('records errors on non-ok responses and thrown fetches', async () => {
        const store = makeStore();
        global.fetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });
        await store.dispatch(madeiraOccurrences.fetchThunk());
        expect(store.getState().madeiraOccurrences.error).toMatch(/HTTP 503/);
        expect(store.getState().madeiraOccurrences.loading).toBe(false);

        global.fetch.mockRejectedValueOnce(new Error('boom'));
        await store.dispatch(madeiraEvent.fetchThunk());
        expect(store.getState().madeiraEvent.error).toBe('boom');
    });

    it('coerces a non-array occurrences payload to []', async () => {
        const store = makeStore();
        global.fetch.mockResolvedValue(ok({ data: null }));
        await store.dispatch(madeiraOccurrences.fetchThunk());
        expect(store.getState().madeiraOccurrences.data).toEqual([]);
    });

    it('keeps the chosen sort across refreshes', async () => {
        const { slice, fetchThunk } = createMadeiraSlice('t', '/api/x', {
            emptyData: [],
            normalize: (j) => j.data,
        });
        const store = configureStore({ reducer: { t: slice.reducer } });
        global.fetch.mockResolvedValue(ok({ data: [{ n: 2 }, { n: 3 }, { n: 1 }] }));
        await store.dispatch(fetchThunk());
        store.dispatch(slice.actions.sort({ field: 'n', order: -1 }));
        expect(store.getState().t.data.map((x) => x.n)).toEqual([3, 2, 1]);

        global.fetch.mockResolvedValue(ok({ data: [{ n: 1 }, { n: 5 }, { n: 4 }] }));
        await store.dispatch(fetchThunk());
        expect(store.getState().t.data.map((x) => x.n)).toEqual([5, 4, 1]);
    });
});

describe('normalizeOccurrence', () => {
    it('defaults copies to 1 and parses numeric coordinates', () => {
        expect(normalizeOccurrence({ copies: 0, lat: '32.65', lng: -16.9 })).toMatchObject({
            copies: 1, lat: 32.65, lng: -16.9, entities: [], entitiesLabel: '',
        });
    });
});

describe('groupByParish', () => {
    const occ = (over) => normalizeOccurrence({ firefighters: 2, vehicles: 1, ...over });

    it('makes one group per parish, summing copies and skipping missing coordinates', () => {
        const groups = groupByParish([
            occ({ id: '1', parishCode: '310307', parish: 'São Martinho', municipality: 'Funchal', lat: 32.64, lng: -16.94 }),
            occ({ id: '2', parishCode: '310307', parish: 'São Martinho', municipality: 'Funchal', lat: 32.64, lng: -16.94, copies: 2 }),
            occ({ id: '3', parishCode: '310403', parish: 'Machico', municipality: 'Machico', lat: 32.71, lng: -16.76 }),
            occ({ id: '4', parishCode: null, lat: null, lng: null }),
        ]);
        expect(groups).toHaveLength(2);
        expect(groups[0]).toMatchObject({
            parishCode: '310307', count: 3, firefighters: 6, vehicles: 3,
        });
        expect(groups[0].occurrences.map((o) => o.id)).toEqual(['1', '2']);
        expect(groups[1]).toMatchObject({ parishCode: '310403', count: 1 });
    });

    it('returns [] when no occurrence has coordinates yet', () => {
        expect(groupByParish([occ({ id: '1', parishCode: '310307' })])).toEqual([]);
    });
});
