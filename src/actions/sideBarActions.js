// actions/sideBarActions.js

// Usa tipos "namespaced" para evitar colisões
export const OPEN_SIDEBAR  = 'sidebar/OPEN';
export const CLOSE_SIDEBAR = 'sidebar/CLOSE';

// Normalizador simples
export const normalizeIncident = (i = {}) => ({
    ...i,
    lat: typeof i.lat === 'number' ? i.lat : Number(i.lat) || null,
    lng: typeof i.lng === 'number' ? i.lng : Number(i.lng) || null,
    crews: Array.isArray(i.crews) ? i.crews : [],
    vehicles: Array.isArray(i.vehicles) ? i.vehicles : [],
    aerials: Array.isArray(i.aerials) ? i.aerials : [],
    boats: Array.isArray(i.boats) ? i.boats : [],
    updates: Array.isArray(i.updates) ? i.updates : [],
    details: Array.isArray(i.details) ? i.details : [],
    man: Number(i.man ?? 0),
    terrain: Number(i.terrain ?? 0),
    aerial: Number(i.aerial ?? 0),
    meios_aquaticos: Number(i.meios_aquaticos ?? 0),
});

// A action creator como thunk para poderes VER o dispatch no console
export const openSideBar = (incident) => (dispatch) => {
    const payload = normalizeIncident(incident);
    console.log('[action] OPEN_SIDEBAR payload:', payload);
    dispatch({ type: OPEN_SIDEBAR, payload });
};

export const closeSideBar = () => (dispatch) => {
    console.log('[action] CLOSE_SIDEBAR');
    dispatch({ type: CLOSE_SIDEBAR });
};
