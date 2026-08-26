import { OPEN_SIDEBAR, CLOSE_SIDEBAR } from '../actions/sideBarActions';

const initialState = {
    open: false,
    incident: null,
};

export default function sideBarReducer(state = initialState, action) {
    switch (action.type) {
        case OPEN_SIDEBAR:
            return { open: true, incident: action.payload };
        case CLOSE_SIDEBAR:
            return { ...initialState };
        default:
            return state;
    }
}
