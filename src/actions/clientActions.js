import { FETCH_INCIDENTS, FETCH_FMA_INCIDENTS_ERROR, FETCH_FMA_INCIDENTS, FETCH_INCIDENT, OPEN_SIDEBAR, SORT_INCIDENTS } from './types';

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

export const fetchFMAIncidents = () => async (dispatch) => {
    try {
        const res = await fetch('https://api-dev.fogos.pt/v2/incidents/active?fma=1&all=1');
        const json = await res.json();
        // A API devolve { data: [...] }, garantimos array
        const data = Array.isArray(json?.data) ? json.data : [];
        dispatch({ type: FETCH_FMA_INCIDENTS, payload: data });
    } catch (err) {
        dispatch({ type: FETCH_FMA_INCIDENTS_ERROR, payload: err?.message || 'Erro ao obter incidentes' });
    }
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

export const sortIncidents = (field, order) => dispatch => {
  dispatch({
    type: SORT_INCIDENTS,
    field: field,
    order: order
  })
};