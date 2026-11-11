import { configureStore } from '@reduxjs/toolkit';
import { allIncidents, fmaIncidents } from './incidentsSlice';
import { madeiraOccurrences, madeiraEvent } from './madeiraSlice';
import sideBar from './sidebarSlice';

const store = configureStore({
    reducer: {
        allIncidents: allIncidents.slice.reducer,
        fmaIncidents: fmaIncidents.slice.reducer,
        madeiraOccurrences: madeiraOccurrences.slice.reducer,
        madeiraEvent: madeiraEvent.slice.reducer,
        sideBar,
    },
});

export default store;
