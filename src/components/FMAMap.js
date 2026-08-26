import React from 'react';
import IncidentMap from './IncidentMap';
import { fetchFMAIncidents } from '../actions/clientActions';

export default function FMAMap() {
    return <IncidentMap sliceName="fmaIncidents" fetchAction={fetchFMAIncidents} />;
}
