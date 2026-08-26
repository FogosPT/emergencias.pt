import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, ZoomControl, ScaleControl, useMapEvent, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { openSideBar, closeSideBar, normalizeIncident } from '../actions/sideBarActions';
import FmaSideBar from './FmaSideBar';
import { STATUS_COLORS, makeIncidentIcon } from './mapIcons';
import './mapLayout.css';

const DEFAULT_CENTER = [39.4392129215951, -8.96362824293375];
const DEFAULT_ZOOM = 8;
const REFRESH_MS = 60_000;

function MapClickHandler({ onMapClick }) {
    useMapEvent('click', () => onMapClick && onMapClick());
    return null;
}

function RecenterOn({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (Array.isArray(center) && center.length === 2) {
            map.setView(center, typeof zoom === 'number' ? zoom : map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
}

function IncidentMarker({ incident, onClick }) {
    const map = useMap();
    const icon = useMemo(() => makeIncidentIcon(incident), [incident]);
    return (
        <Marker
            position={[incident.lat, incident.lng]}
            icon={icon}
            bubblingMouseEvents={false}
            eventHandlers={{
                click: (e) => { e.originalEvent?.stopPropagation(); onClick(incident); },
                mouseover: () => { map.getContainer().style.cursor = 'pointer'; },
                mouseout: () => { map.getContainer().style.cursor = ''; },
                mousedown: (e) => e.originalEvent?.stopPropagation(),
                touchstart: (e) => e.originalEvent?.stopPropagation(),
            }}
        />
    );
}

/**
 * Renders a Leaflet map for a given incidents slice.
 * @param {'allIncidents'|'fmaIncidents'} sliceName
 * @param {() => import('redux').AnyAction} fetchAction
 */
export default function IncidentMap({ sliceName, fetchAction }) {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((s) => s[sliceName]);
    const sideBar = useSelector((s) => s.sideBar);

    const [center, setCenter] = useState(DEFAULT_CENTER);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [showLegend, setShowLegend] = useState(false);

    useEffect(() => {
        dispatch(fetchAction());
        const id = setInterval(() => dispatch(fetchAction()), REFRESH_MS);
        return () => clearInterval(id);
    }, [dispatch, fetchAction]);

    const items = useMemo(
        () => data.filter((i) => i && typeof i.lat === 'number' && typeof i.lng === 'number'),
        [data]
    );

    const handleMarkerClick = useCallback((incident) => {
        const norm = normalizeIncident(incident);
        if (!norm.lat || !norm.lng) return;
        setCenter([norm.lat, norm.lng]);
        setZoom(14);
        dispatch(openSideBar(norm));
    }, [dispatch]);

    const handleMapClick = useCallback(() => {
        dispatch(closeSideBar());
        setCenter(DEFAULT_CENTER);
        setZoom(DEFAULT_ZOOM);
    }, [dispatch]);

    return (
        <div className="map-shell">
            <div className="map-pane">
                <MapContainer className="map-el" center={center} zoom={zoom} zoomControl={false}>
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ZoomControl position="topright" />
                    <ScaleControl position="bottomleft" />
                    <MapClickHandler onMapClick={handleMapClick} />
                    <RecenterOn center={center} zoom={zoom} />
                    {items.map((inc) => (
                        <IncidentMarker
                            key={inc.id ?? `${inc.lat}-${inc.lng}-${inc.date ?? ''}`}
                            incident={inc}
                            onClick={handleMarkerClick}
                        />
                    ))}
                </MapContainer>

                {showLegend ? (
                    <div
                        onClick={() => setShowLegend(false)}
                        className="map-legend cursor-pointer"
                        role="button"
                        aria-label="Fechar legenda"
                    >
                        {Object.entries(STATUS_COLORS).map(([label, color]) => (
                            <div key={label} className="map-legend__row">
                                <span className="map-legend__dot" style={{ background: color }} />
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <button
                        type="button"
                        className="map-legend-toggle"
                        onClick={() => setShowLegend(true)}
                        aria-label="Mostrar legenda"
                    >
                        🛈
                    </button>
                )}

                {loading && <div className="map-banner">A carregar…</div>}
                {error && <div className="map-banner map-banner--error">{error}</div>}
            </div>

            {sideBar?.open && sideBar.incident ? (
                <div className="sidebar-pane">
                    <FmaSideBar incident={sideBar.incident} onClose={handleMapClick} />
                </div>
            ) : null}
        </div>
    );
}
