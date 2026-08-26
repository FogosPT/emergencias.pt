import {
    FETCH_ALL_PENDING, FETCH_ALL_FULFILLED, FETCH_ALL_REJECTED, SORT_ALL,
    FETCH_FMA_PENDING, FETCH_FMA_FULFILLED, FETCH_FMA_REJECTED, SORT_FMA,
} from './types';

const ENDPOINT = '/api/v2/incidents/active';

const fetchSlice = (query, [pending, fulfilled, rejected]) => async (dispatch) => {
    dispatch({ type: pending });
    try {
        const res = await fetch(`${ENDPOINT}${query}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        dispatch({ type: fulfilled, payload: data });
    } catch (err) {
        dispatch({ type: rejected, payload: err?.message || 'Erro ao obter incidentes' });
    }
};

export const fetchIncidents = () =>
    fetchSlice('?all=1', [FETCH_ALL_PENDING, FETCH_ALL_FULFILLED, FETCH_ALL_REJECTED]);

export const fetchFMAIncidents = () =>
    fetchSlice('?fma=1&all=1', [FETCH_FMA_PENDING, FETCH_FMA_FULFILLED, FETCH_FMA_REJECTED]);

export const sortIncidents = (field, order) => ({ type: SORT_ALL, field, order });
export const sortFMAIncidents = (field, order) => ({ type: SORT_FMA, field, order });
