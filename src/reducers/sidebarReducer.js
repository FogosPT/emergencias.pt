
import { OPEN_SIDEBAR, CLOSE_SIDEBAR } from '../actions/types';

const initialState = {
    sideBarOpen: false,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case OPEN_SIDEBAR:
      return {
        ...state,
        sideBarOpen: true,
        incident: action.incident
      };
    case CLOSE_SIDEBAR:
      return {
        ...state,
        sideBarOpen: false,
      };
    default:
      return state;
  }
}