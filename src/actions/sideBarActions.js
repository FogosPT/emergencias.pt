export const OPEN_SIDEBAR = 'sidebar/OPEN';
export const CLOSE_SIDEBAR = 'sidebar/CLOSE';

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

export const openSideBar = (incident) => ({
    type: OPEN_SIDEBAR,
    payload: normalizeIncident(incident),
});

export const closeSideBar = () => ({ type: CLOSE_SIDEBAR });
