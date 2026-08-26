import { createSlice } from '@reduxjs/toolkit';

const normalizeIncident = (i = {}) => ({
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

const sidebarSlice = createSlice({
    name: 'sideBar',
    initialState: { open: false, incident: null },
    reducers: {
        open: (state, action) => {
            state.open = true;
            state.incident = normalizeIncident(action.payload);
        },
        close: (state) => {
            state.open = false;
            state.incident = null;
        },
    },
});

export const { open: openSideBar, close: closeSideBar } = sidebarSlice.actions;
export { normalizeIncident };
export default sidebarSlice.reducer;
