import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import sideBar, { openSideBar, closeSideBar, normalizeIncident } from './sidebarSlice.js';

const makeStore = () => configureStore({ reducer: { sideBar } });

describe('sidebarSlice', () => {
    it('starts closed with no incident', () => {
        const store = makeStore();
        expect(store.getState().sideBar).toEqual({ open: false, incident: null });
    });

    it('opens with normalized incident', () => {
        const store = makeStore();
        store.dispatch(openSideBar({ id: 1, lat: '39.5', lng: '-8.9', man: '3' }));
        const { open, incident } = store.getState().sideBar;
        expect(open).toBe(true);
        expect(incident.lat).toBe(39.5);
        expect(incident.lng).toBe(-8.9);
        expect(incident.man).toBe(3);
        expect(incident.crews).toEqual([]);
    });

    it('closes and drops incident', () => {
        const store = makeStore();
        store.dispatch(openSideBar({ id: 1, lat: 1, lng: 2 }));
        store.dispatch(closeSideBar());
        expect(store.getState().sideBar).toEqual({ open: false, incident: null });
    });

    it('normalizeIncident coerces invalid coords to null', () => {
        const n = normalizeIncident({ lat: 'not-a-number', lng: undefined });
        expect(n.lat).toBe(null);
        expect(n.lng).toBe(null);
    });
});
