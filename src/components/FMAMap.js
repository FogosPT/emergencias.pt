// components/FmaMap.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchFMAIncidents, sortIncidents } from '../actions/clientActions';
import { openSideBar, closeSideBar, normalizeIncident } from '../actions/sideBarActions';

import {
    MapContainer,
    TileLayer,
    CircleMarker,
    ZoomControl,
    ScaleControl,
    useMapEvent,
    useMap,
    Tooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import FmaSideBar from './FmaSideBar';
import './mapLayout.css';

// 1) ADICIONA isto perto do topo do ficheiro (depois dos imports)
const STATUS_COLORS = {
    'Em Curso':        '#ef4444', // red-500
    'Despacho':        '#f59e0b', // amber-500
    'Despacho de 1º Alerta': '#f59e0b',
    'Chegada ao TO':   '#f59e0b',
    'Em Resolução':    '#22c55e', // green-500
    'Conclusão':       '#22c55e',
    'Vigilância':      '#3b82f6', // blue-500
};

function getStatusColor(status) {
    if (!status) return '#6b7280';          // gray-500 default
    return STATUS_COLORS[status] || '#6b7280';
}

// Centro PT [lat, lng]
const DEFAULT_CENTER = [39.4392129215951, -8.96362824293375];
const DEFAULT_ZOOM = 8;

function MapClickHandler({ onMapClick }) {
    useMapEvent('click', () => onMapClick && onMapClick());
    return null;
}
function RecenterOn({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center && Array.isArray(center) && center.length === 2) {
            map.setView(center, typeof zoom === 'number' ? zoom : map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
}

function FMAMap({
                    fetchFMAIncidents,
                    incidents,     // { incidents: [], loading, error }
                    sideBarOpen,   // { open, incident }
                    openSideBar,
                    closeSideBar,
                }) {
    const [center, setCenter] = useState(DEFAULT_CENTER);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);

    useEffect(() => { fetchFMAIncidents?.(); }, [fetchFMAIncidents]);

    const items = useMemo(() => {
        const list = Array.isArray(incidents?.incidents) ? incidents.incidents : [];
        return list.filter(i => i && typeof i.lat === 'number' && typeof i.lng === 'number');
    }, [incidents]);

    const handleMarkerClick = useCallback((incident) => {
        const norm = normalizeIncident(incident);
        if (!norm.lat || !norm.lng) return;
        setCenter([norm.lat, norm.lng]);
        setZoom(14);
        console.log('[FMAMap] clicking marker -> dispatch openSideBar');
        openSideBar(norm);
    }, [openSideBar]);

    const handleMapClick = useCallback(() => {
        closeSideBar();      // <-- sem ?.
        setCenter(DEFAULT_CENTER);
        setZoom(DEFAULT_ZOOM);
    }, [closeSideBar]);

    const Marker = ({ incident }) => {
        const map = useMap();
        const color = getStatusColor(incident.status);
        const isActive = incident.status === "Em Curso";

        return (
            <>
                {/* PULSE LAYER - atrás */}
                {isActive && (
                    <CircleMarker
                        center={[incident.lat, incident.lng]}
                        radius={10}
                        pathOptions={{ color: color, fillColor: color, fillOpacity: 0.5, weight: 0 }}
                        className="fma-pulse"            // <--- magia aqui
                        bubblingMouseEvents={false}
                    />
                )}

                {/* MARCADOR PRINCIPAL */}
                <CircleMarker
                    center={[incident.lat, incident.lng]}
                    radius={7}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
                    bubblingMouseEvents={false}
                    eventHandlers={{
                        click: (e) => { e.originalEvent?.stopPropagation(); handleMarkerClick(incident); },
                        mouseover: () => { map.getContainer().style.cursor = 'pointer'; },
                        mouseout:  () => { map.getContainer().style.cursor = ''; },
                        mousedown: (e) => e.originalEvent?.stopPropagation(),
                        touchstart:(e) => e.originalEvent?.stopPropagation(),
                    }}
                />
            </>
        );
    };


    const isOpen = Boolean(sideBarOpen?.open);
    const current = sideBarOpen?.incident;

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
                        <Marker key={inc.id ?? `${inc.lat}-${inc.lng}-${inc.date ?? ''}`} incident={inc} />
                    ))}
                </MapContainer>
                {/* 3) MINI-LEGENDA no canto superior direito do mapa */}
                <div style={{
                    position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.92)', zIndex: 1000,
                    borderRadius: 8, padding: '6px 10px', boxShadow: '0 1px 3px rgba(0,0,0,.12)', fontSize: 12
                }}>
                    {[
                        ['Em Curso',        STATUS_COLORS['Em Curso']],
                        ['Despacho',        STATUS_COLORS['Despacho']],
                        ['Em Resolução',    STATUS_COLORS['Em Resolução']],
                        ['Conclusão',       STATUS_COLORS['Conclusão']],
                        ['Vigilância',      STATUS_COLORS['Vigilância']],
                    ].map(([label, color]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <span style={{
          width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block',
          border: '2px solid rgba(0,0,0,0.1)'
      }} />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>



                {incidents?.loading && <div className="map-banner">A carregar…</div>}
                {incidents?.error && <div className="map-banner map-banner--error">{incidents.error}</div>}
            </div>

            {isOpen && current ? (
                <div className="sidebar-pane">
                    <FmaSideBar incident={current} onClose={handleMapClick} />
                </div>
            ) : null}
        </div>
    );
}
FMAMap.propTypes = {
    fetchFMAIncidents: PropTypes.func.isRequired,
    sortIncidents: PropTypes.func,
    incidents: PropTypes.shape({
        incidents: PropTypes.array,
        loading: PropTypes.bool,
        error: PropTypes.any,
    }).isRequired,
    sideBarOpen: PropTypes.shape({
        open: PropTypes.bool,
        incident: PropTypes.object,
    }).isRequired,
    openSideBar: PropTypes.func.isRequired,
    closeSideBar: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    // ajusta se usas FMAIncidents:
    incidents: state.FMAIncidents || state.incidents || { incidents: [] },
    sideBarOpen: state.sideBarOpen,
});

// mapDispatch EXPLÍCITO para não haver dúvidas que vai mesmo ao dispatch
const mapDispatchToProps = (dispatch) => ({
    fetchFMAIncidents: () => dispatch(fetchFMAIncidents()),
    sortIncidents: (...args) => dispatch(sortIncidents(...args)),
    openSideBar: (inc) => dispatch(openSideBar(inc)),
    closeSideBar: () => dispatch(closeSideBar()),
});

export default connect(mapStateToProps, mapDispatchToProps)(FMAMap);