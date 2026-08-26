import { combineReducers } from 'redux';
import { createIncidentsReducer } from './incidentsSlice';
import sideBar from './sidebarReducer';
import {
    FETCH_ALL_PENDING, FETCH_ALL_FULFILLED, FETCH_ALL_REJECTED, SORT_ALL,
    FETCH_FMA_PENDING, FETCH_FMA_FULFILLED, FETCH_FMA_REJECTED, SORT_FMA,
} from '../actions/types';

const allIncidents = createIncidentsReducer({
    pending: FETCH_ALL_PENDING,
    fulfilled: FETCH_ALL_FULFILLED,
    rejected: FETCH_ALL_REJECTED,
    sort: SORT_ALL,
});

const fmaIncidents = createIncidentsReducer({
    pending: FETCH_FMA_PENDING,
    fulfilled: FETCH_FMA_FULFILLED,
    rejected: FETCH_FMA_REJECTED,
    sort: SORT_FMA,
});

export default combineReducers({
    allIncidents,
    fmaIncidents,
    sideBar,
});
