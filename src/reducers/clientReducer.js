
import { FETCH_INCIDENTS, FETCH_INCIDENT, SORT_INCIDENTS } from '../actions/types';

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
    case SORT_INCIDENTS:
      console.log(action.order);
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