
import { FETCH_INCIDENTS, FETCH_INCIDENT } from '../actions/types';

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
    default:
      return state;
  }
}