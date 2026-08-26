import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { createIncidentsSlice } from './incidentsSlice.js';

const setup = () => {
    const { slice, fetchThunk } = createIncidentsSlice('test', '?all=1');
    const store = configureStore({ reducer: { test: slice.reducer } });
    return { store, slice, fetchThunk };
};

describe('incidentsSlice', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it('has empty initial state', () => {
        const { store } = setup();
        expect(store.getState().test).toEqual({ data: [], loading: false, error: null });
    });

    it('sets loading on pending', () => {
        const { store, fetchThunk } = setup();
        global.fetch.mockReturnValue(new Promise(() => {})); // never resolves
        store.dispatch(fetchThunk());
        expect(store.getState().test.loading).toBe(true);
        expect(store.getState().test.error).toBe(null);
    });

    it('populates data on fulfilled', async () => {
        const { store, fetchThunk } = setup();
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ id: 1 }, { id: 2 }] }),
        });
        await store.dispatch(fetchThunk());
        expect(store.getState().test).toEqual({
            data: [{ id: 1 }, { id: 2 }],
            loading: false,
            error: null,
        });
    });

    it('records error on non-ok response', async () => {
        const { store, fetchThunk } = setup();
        global.fetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
        await store.dispatch(fetchThunk());
        const state = store.getState().test;
        expect(state.loading).toBe(false);
        expect(state.error).toMatch(/HTTP 500/);
    });

    it('records error on thrown fetch', async () => {
        const { store, fetchThunk } = setup();
        global.fetch.mockRejectedValue(new Error('boom'));
        await store.dispatch(fetchThunk());
        expect(store.getState().test.error).toBe('boom');
    });

    it('coerces non-array payloads to []', async () => {
        const { store, fetchThunk } = setup();
        global.fetch.mockResolvedValue({ ok: true, json: async () => ({ data: null }) });
        await store.dispatch(fetchThunk());
        expect(store.getState().test.data).toEqual([]);
    });

    it('sort respects ascending/descending order', () => {
        const { store, slice } = setup();
        const seed = [{ n: 3 }, { n: 1 }, { n: 2 }];
        store.dispatch(slice.actions.sort({ field: 'n', order: 1 }));
        // seeded via a fake fulfilled action first
        store.dispatch({ type: `${slice.name}/fetch/fulfilled`, payload: seed });
        store.dispatch(slice.actions.sort({ field: 'n', order: 1 }));
        expect(store.getState().test.data.map((x) => x.n)).toEqual([1, 2, 3]);

        store.dispatch(slice.actions.sort({ field: 'n', order: -1 }));
        expect(store.getState().test.data.map((x) => x.n)).toEqual([3, 2, 1]);
    });
});
