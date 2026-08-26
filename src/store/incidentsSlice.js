import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const ENDPOINT = '/api/v2/incidents/active';

const initialState = {
    data: [],
    loading: false,
    error: null,
};

function sortBy(list, field, order) {
    const sign = order === -1 ? -1 : 1;
    return [...list].sort((a, b) => {
        const av = a?.[field];
        const bv = b?.[field];
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return av < bv ? -1 * sign : 1 * sign;
    });
}

export function createIncidentsSlice(name, query) {
    const fetchThunk = createAsyncThunk(`${name}/fetch`, async () => {
        const res = await fetch(`${ENDPOINT}${query}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return Array.isArray(json?.data) ? json.data : [];
    });

    const slice = createSlice({
        name,
        initialState,
        reducers: {
            sort: (state, action) => {
                state.data = sortBy(state.data, action.payload.field, action.payload.order);
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
                    state.data = action.payload;
                })
                .addCase(fetchThunk.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error?.message || 'Erro ao obter incidentes';
                });
        },
    });

    return { slice, fetchThunk };
}

export const allIncidents = createIncidentsSlice('allIncidents', '?all=1');
export const fmaIncidents = createIncidentsSlice('fmaIncidents', '?fma=1&all=1');
