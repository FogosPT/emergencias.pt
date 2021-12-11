import { FETCH_INCIDENTS, FETCH_INCIDENT, OPEN_SIDEBAR } from './types';

export const fetchIncidents = () => dispatch => {
  fetch('https://api-dev.fogos.pt/v2/incidents/active?all=1')
    .then(res => res.json())
    .then(incidents =>
      dispatch({
        type: FETCH_INCIDENTS,
        payload: incidents.data
      })
    );
};

export const fetchIncident = (id) => dispatch => {
  fetch('https://api-dev.fogos.pt/fires?id=' + id)
    .then(res => res.json())
    .then(incidents =>
      dispatch({
        type: FETCH_INCIDENT,
        payload: incidents.data
      })
    ).then( action =>
      dispatch({
        type: OPEN_SIDEBAR,
        incident: action.payload
      })
    );
};