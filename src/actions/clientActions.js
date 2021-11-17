import { FETCH_INCIDENTS } from './types';

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