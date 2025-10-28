
import { FETCH_INCIDENTS, FETCH_FMA_INCIDENTS, FETCH_FMA_INCIDENTS_ERROR, FETCH_INCIDENT, SORT_INCIDENTS } from '../actions/types';

const initialState = {
  incidents: [],
};

export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_INCIDENTS:
      return {
        ...state,
        incidents: action.payload
      };
    case FETCH_INCIDENT:
      return {
        ...state,
        incident: action.payload
      };
    case FETCH_FMA_INCIDENTS:
      return {
        ...state,
        incidents: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
        error: null,
      };
    case FETCH_FMA_INCIDENTS_ERROR:
      return { ...state, loading: false, error: action.payload };
    case SORT_INCIDENTS:
      let x = state.incidents.slice().sort(function(a, b) {
          if (a[action.field] < b[action.field]) return -1;
          if (a[action.field] < b[action.field]) return 1;
        return 0;
      });

      if(action.order === -1){
        x.reverse()
      }
      return {
        ...state,
        incidents: x
      };
    default:
      return state;
  }
}