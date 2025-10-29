// reducers/sidebarReducer.js
import { OPEN_SIDEBAR, CLOSE_SIDEBAR } from '../actions/sideBarActions';

const initialState = {
  open: false,
  incident: null,
};

export default function sidebarReducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_SIDEBAR:
      console.log('[reducer] OPEN_SIDEBAR', action.payload);
      return { open: true, incident: action.payload };
    case CLOSE_SIDEBAR:
      console.log('[reducer] CLOSE_SIDEBAR');
      return { ...initialState };
    default:
      return state;
  }
}
