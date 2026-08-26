import React from 'react';
import IncidentMap from './IncidentMap';
import { fetchIncidents } from '../actions/clientActions';

export default function AllMap() {
    return <IncidentMap sliceName="allIncidents" fetchAction={fetchIncidents} />;
}
