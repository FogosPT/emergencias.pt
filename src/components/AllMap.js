import React from 'react';
import IncidentMap from './IncidentMap.js';
import { allIncidents } from '../store/incidentsSlice.js';

export default function AllMap() {
    return <IncidentMap sliceName="allIncidents" fetchAction={allIncidents.fetchThunk} />;
}
