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
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import FmaSideBar from './FmaSideBar';
import './mapLayout.css';

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
        return (
            <CircleMarker
                center={[incident.lat, incident.lng]}
                radius={6}
                pathOptions={{ color: '#E54E52', fillOpacity: 0.8 }}
                bubblingMouseEvents={false}            // ⬅️ impede o bubbling para o mapa
                eventHandlers={{
                    click: (e) => {
                        e.originalEvent?.stopPropagation(); // ⬅️ garante que o MapClick não dispara
                        handleMarkerClick(incident);
                    },
                    mouseover: () => { map.getContainer().style.cursor = 'pointer'; },
                    mouseout:  () => { map.getContainer().style.cursor = ''; },
                    // (opcional, para mobile)
                    mousedown: (e) => e.originalEvent?.stopPropagation(),
                    touchstart: (e) => e.originalEvent?.stopPropagation(),
                }}
            />
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