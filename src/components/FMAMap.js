import React from 'react';
import IncidentMap from './IncidentMap.js';
import { fmaIncidents } from '../store/incidentsSlice.js';

export default function FMAMap() {
    return <IncidentMap sliceName="fmaIncidents" fetchAction={fmaIncidents.fetchThunk} />;
}
