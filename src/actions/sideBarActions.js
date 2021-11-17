import { OPEN_SIDEBAR, CLOSE_SIDEBAR } from './types';

const openSideBar = (incident) => ( { type: OPEN_SIDEBAR, incident: incident } )

export { openSideBar, OPEN_SIDEBAR }

const closeSideBar = () => ( { type: CLOSE_SIDEBAR, } )

export { closeSideBar, CLOSE_SIDEBAR }