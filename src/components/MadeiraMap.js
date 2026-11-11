import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, ScaleControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { madeiraOccurrences, groupByParish } from '../store/madeiraSlice.js';
import { makeParishIcon } from './mapIcons.js';
import { formatTime, APPROX_LOCATION_LABEL, SOURCE_LABEL } from './madeiraFormat.js';
import './mapLayout.css';

// Madeira + Porto Santo in view.
const DEFAULT_CENTER = [32.85, -16.8];
const DEFAULT_ZOOM = 10;
const REFRESH_MS = 60_000;

const dominantNature = (occurrences) => {
    const counts = new Map();
    for (const o of occurrences) counts.set(o.nature, (counts.get(o.nature) || 0) + (o.copies || 1));
    let best = '';
    let max = -1;
    for (const [nature, n] of counts) if (n > max) { best = nature; max = n; }
    return best;
};

function ParishMarker({ group }) {
    const icon = useMemo(
        () => makeParishIcon({ count: group.count, nature: dominantNature(group.occurrences) }),
        [group]
    );
    const title = [group.parish, group.municipality].filter(Boolean).join(', ') || 'Freguesia desconhecida';
    return (
        <Marker position={[group.lat, group.lng]} icon={icon} title={`${title}: ${group.count} ocorrências`}>
            <Popup>
                <div className="parish-popup">
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs">
                        {group.count} ocorrência{group.count === 1 ? '' : 's'} · 👩‍🚒 {group.firefighters} · 🚒 {group.vehicles}
                    </p>
                    <p className="text-xs italic text-gray-600">{APPROX_LOCATION_LABEL}</p>
                    <ul>
                        {group.occurrences.map((o) => (
                            <li key={o.id} className="text-xs">
                                <strong>{formatTime(o.start)}</strong> {o.nature}
                                {o.copies > 1 ? ` ×${o.copies}` : ''}
                                {' '}· 👩‍🚒 {o.firefighters} · 🚒 {o.vehicles}
                                {o.entitiesLabel ? ` · ${o.entitiesLabel}` : ''}
                            </li>
                        ))}
                    </ul>
                </div>
            </Popup>
        </Marker>
    );
}

export default function MadeiraMap() {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((s) => s.madeiraOccurrences);

    useEffect(() => {
        dispatch(madeiraOccurrences.fetchThunk());
        const id = setInterval(() => dispatch(madeiraOccurrences.fetchThunk()), REFRESH_MS);
        return () => clearInterval(id);
    }, [dispatch]);

    const groups = useMemo(() => groupByParish(data), [data]);
    const withoutLocation = useMemo(
        () => data.filter((o) => typeof o.lat !== 'number' || typeof o.lng !== 'number')
            .reduce((n, o) => n + (o.copies || 1), 0),
        [data]
    );

    return (
        <div className="map-shell">
            <div className="map-pane">
                <MapContainer className="map-el" center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} zoomControl={false}>
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors · SRPC, IP-RAM (via Fogos.pt)"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ZoomControl position="topright" />
                    <ScaleControl position="bottomleft" />
                    {groups.map((g) => <ParishMarker key={g.key} group={g} />)}
                </MapContainer>

                <div className="map-note" role="note">
                    {APPROX_LOCATION_LABEL}: um marcador por freguesia, últimas 24 h.
                    {withoutLocation > 0 ? (
                        <> {withoutLocation} sem localização — ver <Link to="/madeira" className="underline">lista</Link>.</>
                    ) : null}
                </div>
                <div className="map-source">{SOURCE_LABEL}</div>

                {loading && <div className="map-banner">A carregar…</div>}
                {error && <div className="map-banner map-banner--error">{error}</div>}
            </div>
        </div>
    );
}
