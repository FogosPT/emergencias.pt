// reducers/incidentsReducer.js
import {
    FETCH_FMA_INCIDENTS_REQUEST,
    FETCH_FMA_INCIDENTS_SUCCESS,
    FETCH_FMA_INCIDENTS_ERROR,
} from '../actions/clientActions';

const initialState = {
    incidents: [],
    loading: false,
    error: null,
};

export default function incidentsReducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_FMA_INCIDENTS_REQUEST:
            return { ...state, loading: true, error: null };
        case FETCH_FMA_INCIDENTS_SUCCESS:
            return { ...state, loading: false, incidents: Array.isArray(action.payload) ? action.payload : [] };
        case FETCH_FMA_INCIDENTS_ERROR:
            return { ...state, loading: false, error: action.payload, incidents: [] };
        default:
            return state;
    }
}