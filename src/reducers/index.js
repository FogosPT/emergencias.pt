import { combineReducers } from 'redux';
import clientReducer from './clientReducer';
import sidebarReducer from './sidebarReducer';

export default combineReducers({
  incidents: clientReducer,
  sideBarOpen: sidebarReducer,
});