import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sortBy } from './incidentsSlice.js';

// SRPC, IP-RAM data (Madeira civil protection) as served by the Fogos.pt API,
// proxied by the Pages Functions under functions/api/v2/madeira/.
export const OCCURRENCES_ENDPOINT = '/api/v2/madeira/occurrences';
export const EVENT_ENDPOINT = '/api/v2/madeira/events/current';

const toNumberOrNull = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

/**
 * Normalises one SRPC-RAM occurrence. lat/lng are only an approximation
 * (parish centroid) and may be missing until the API exposes them.
 */
export function normalizeOccurrence(o = {}) {
    const entities = Array.isArray(o.entities) ? o.entities.filter(Boolean) : [];
    const copies = Number(o.copies);
    return {
        ...o,
        copies: Number.isFinite(copies) && copies >= 1 ? copies : 1,
        firefighters: Number(o.firefighters) || 0,
        vehicles: Number(o.vehicles) || 0,
        lat: toNumberOrNull(o.lat),
        lng: toNumberOrNull(o.lng),
        entities,
        entitiesLabel: entities.join(', '),
    };
}

const normalizeOccurrences = (json) => (
    Array.isArray(json?.data) ? json.data.map(normalizeOccurrence) : []
);

const normalizeEvent = (json) => (
    json?.data && typeof json.data === 'object' && !Array.isArray(json.data) ? json.data : null
);

/**
 * Generic fetch slice for the Madeira endpoints.
 * Shape: { data, loading, error, sort } — `sort` ({ field, order }) is kept
 * so a refresh re-applies the user's chosen order to list payloads.
 */
export function createMadeiraSlice(name, url, { emptyData, normalize }) {
    const fetchThunk = createAsyncThunk(`${name}/fetch`, async () => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return normalize(await res.json());
    });

    const slice = createSlice({
        name,
        initialState: { data: emptyData, loading: false, error: null, sort: null },
        reducers: {
            sort: (state, action) => {
                const { field, order } = action.payload;
                state.sort = { field, order };
                if (Array.isArray(state.data)) state.data = sortBy(state.data, field, order);
            },
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchThunk.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(fetchThunk.fulfilled, (state, action) => {
                    state.loading = false;
                    state.error = null;
                    state.data = state.sort && Array.isArray(action.payload)
                        ? sortBy(action.payload, state.sort.field, state.sort.order)
                        : action.payload;
                })
                .addCase(fetchThunk.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error?.message || 'Erro ao obter dados da Madeira';
                });
        },
    });

    return { slice, fetchThunk };
}

// Last 24 h (upstream default when `from` is omitted).
export const madeiraOccurrences = createMadeiraSlice('madeiraOccurrences', OCCURRENCES_ENDPOINT, {
    emptyData: [],
    normalize: normalizeOccurrences,
});

export const madeiraEvent = createMadeiraSlice('madeiraEvent', EVENT_ENDPOINT, {
    emptyData: null,
    normalize: normalizeEvent,
});

/**
 * Groups occurrences with coordinates into one entry per parish
 * (parishCode, falling back to the coordinates). `count` sums `copies`;
 * firefighters/vehicles are multiplied by `copies`.
 * Occurrences without lat/lng are left out (they are still listed elsewhere).
 */
export function groupByParish(occurrences = []) {
    const groups = new Map();
    for (const o of occurrences) {
        if (typeof o?.lat !== 'number' || typeof o?.lng !== 'number') continue;
        const key = o.parishCode || `${o.lat},${o.lng}`;
        let g = groups.get(key);
        if (!g) {
            g = {
                key,
                parishCode: o.parishCode ?? null,
                parish: o.parish ?? null,
                municipality: o.municipality ?? null,
                lat: o.lat,
                lng: o.lng,
                count: 0,
                firefighters: 0,
                vehicles: 0,
                occurrences: [],
            };
            groups.set(key, g);
        }
        // Same rule as the upstream event aggregation: identical rows count
        // as separate occurrences, so resources are multiplied by `copies`.
        const copies = o.copies || 1;
        g.count += copies;
        g.firefighters += (o.firefighters || 0) * copies;
        g.vehicles += (o.vehicles || 0) * copies;
        g.occurrences.push(o);
    }
    return [...groups.values()].sort((a, b) => b.count - a.count);
}
