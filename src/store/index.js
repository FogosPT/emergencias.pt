import { configureStore } from '@reduxjs/toolkit';
import { allIncidents, fmaIncidents } from './incidentsSlice';
import sideBar from './sidebarSlice';

const store = configureStore({
    reducer: {
        allIncidents: allIncidents.slice.reducer,
        fmaIncidents: fmaIncidents.slice.reducer,
        sideBar,
    },
});

export default store;
