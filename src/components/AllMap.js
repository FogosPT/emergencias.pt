// components/FmaMap.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchIncidents, sortIncidents } from '../actions/clientActions';
import { openSideBar, closeSideBar, normalizeIncident } from '../actions/sideBarActions';

import {
    MapContainer,
    TileLayer,
    Marker,
    ZoomControl,
    ScaleControl,
    useMapEvent,
    useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import FmaSideBar from './FmaSideBar';
import './mapLayout.css';

/* ==================== ÍCONES: cor por estado + glyph por naturezaName ==================== */

// Estado → cor
const STATUS_COLORS = {
    'Em Curso':              '#ef4444', // red-500
    'Despacho':              '#f59e0b', // amber-500
    'Despacho de 1º Alerta': '#f59e0b',
    'Chegada ao TO':         '#f59e0b',
    'Em Resolução':          '#22c55e', // green-500
    'Conclusão':             '#22c55e',
    'Vigilância':            '#3b82f6', // blue-500
};
const getStatusColor = (status) => STATUS_COLORS[status] || '#6b7280'; // gray-500

// naturezaName → ícone (emoji; troca por SVG inline se quiseres)
const GLYPHS = {
    fogo: '🔥', mato: '🌿', florestal: '🌲', povoamento: '🌲',
    agrícola: '🚜', urbano: '🏙️', habitacional: '🏠',
    industria: '🏭', armazem: '📦', oficina: '🔧',
    rodoviario: '🚗', colisao: '🚗', despiste: '🚗',
    ferroviario: '🚆', aereo: '✈️', aquatico: '🚤',
    inundacao: '🌊', cheia: '🌊', enxurrada: '🌧️',
    ventos: '💨', sismo: '🌎', queda: '🪵',
    explosao: '💥', quimicos: '☣️', biologicos: '🧫',
    toxico: '☠️', combustivel: '🛢️', gas: '🧯',
    resgate: '🆘', pessoas: '🚑', trauma: '🩹', incendio: '🔥',
};

function getGlyphByNaturezaName(naturezaName = '') {
    const n = String(naturezaName).toLowerCase();
    const rules = [
        [/rurais|mato|queima|gestão de combustível|riscos mistos.*mato/, GLYPHS.mato],
        [/povoamento|florestal|riscos mistos.*povoamento/,              GLYPHS.florestal],
        [/agrícola|agricola/,                                            GLYPHS.agrícola],
        [/rodoviár|rodoviario|colis[aã]o|despiste|atropelamento/,        GLYPHS.rodoviario],
        [/ferroviár|ferroviario|descarril|atropelamento ferrovi[aá]rio/, GLYPHS.ferroviario],
        [/a[eé]reo|avi[aã]o|helic[oó]ptero/,                             GLYPHS.aereo],
        [/aqu[aá]tico|afogamento|afundamento|abalroamento aqu[aá]tico|encalhe/, GLYPHS.aquatico],
        [/inunda[cç][aã]o|cheia|enxurrada|galgamento costeiro/,          GLYPHS.inundacao],
        [/ventos|nev[õo]es|tempestade/,                                  GLYPHS.ventos],
        [/sismo|terramoto/,                                              GLYPHS.sismo],
        [/queda de [aá]rvore|queda.*elementos/,                          GLYPHS.queda],
        [/explos[aã]o|amea[cç]a de explos[aã]o/,                         GLYPHS.explosao],
        [/qu[ií]micos|mat[eé]rias perigosas|produtos/,                   GLYPHS.quimicos],
        [/biol[oó]gicos/,                                                GLYPHS.biologicos],
        [/g[aá]s|fuga de g[aá]s|conduta/,                                 GLYPHS.gas],
        [/ind[uú]stria|oficina|armaz[eé]m/,                              GLYPHS.industria],
        [/habitacion|edif[ií]cio|urbano/,                                GLYPHS.habitacional],
        [/resgate|socorro|apoio psicossocial|evacua[cç][aã]o|transporte m[eé]dico/, GLYPHS.resgate],
        [/trauma|intoxica[cç][aã]o|suic[ií]dio|homic[ií]dio/,            GLYPHS.trauma],
        [/inc[eê]ndio/,                                                  GLYPHS.fogo],
    ];
    for (const [re, g] of rules) if (re.test(n)) return g;
    for (const k of Object.keys(GLYPHS)) if (n.includes(k)) return GLYPHS[k];
    return '⚠️';
}

function makeIncidentIcon(incident = {}) {
    const color = getStatusColor(incident.status);
    const glyph = getGlyphByNaturezaName(incident.naturezaName || incident.natureza);
    const isActive = incident.status === 'Em Curso';

    const html = `
    <div class="fma-pin ${isActive ? 'fma-pulse-wrapper' : ''}">
      ${isActive ? '<div class="fma-pulse-ring"></div>' : ''}
      <div class="fma-pin-core" style="border-color:${color}; background:${color};">
        <div class="fma-pin-glyph">${glyph}</div>
      </div>
    </div>
  `;
    return L.divIcon({
        html,
        className: 'fma-divicon',
        iconSize: [72, 72],      // antes 36x36
        iconAnchor: [36, 36],    // centro (metade de 72)
        tooltipAnchor: [0, -36],
        popupAnchor: [0, -36],
    });
}

/* ==================== Mapa ==================== */

const DEFAULT_CENTER = [39.4392129215951, -8.96362824293375];
const DEFAULT_ZOOM = 8;

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

// Marcador com DivIcon + sem tooltip
const MarkerIcon = ({ incident, onClick }) => {
    const map = useMap();
    const icon = makeIncidentIcon(incident);
    return (
        <Marker
            position={[incident.lat, incident.lng]}
            icon={icon}
            bubblingMouseEvents={false}
            eventHandlers={{
                click: (e) => { e.originalEvent?.stopPropagation(); onClick(incident); },
                mouseover: () => { map.getContainer().style.cursor = 'pointer'; },
                mouseout:  () => { map.getContainer().style.cursor = ''; },
                mousedown: (e) => e.originalEvent?.stopPropagation(),
                touchstart:(e) => e.originalEvent?.stopPropagation(),
            }}
        />
    );
};

function FMAMap({
                    fetchIncidents,
                    incidents,     // { incidents: [], loading, error }
                    sideBarOpen,   // { open, incident }
                    openSideBar,
                    closeSideBar,
                }) {
    const [center, setCenter] = useState(DEFAULT_CENTER);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);

    useEffect(() => { fetchIncidents?.(); }, [fetchIncidents]);

    // auto-refresh a cada 60s
    useEffect(() => {
        const id = setInterval(() => fetchIncidents?.(), 60_000);
        return () => clearInterval(id);
    }, [fetchIncidents]);

    const items = useMemo(() => {
        const list = Array.isArray(incidents?.incidents) ? incidents.incidents : [];
        return list.filter(i => i && typeof i.lat === 'number' && typeof i.lng === 'number');
    }, [incidents]);

    const handleMarkerClick = useCallback((incident) => {
        const norm = normalizeIncident(incident);
        if (!norm.lat || !norm.lng) return;
        setCenter([norm.lat, norm.lng]);
        setZoom(14);
        openSideBar(norm);
    }, [openSideBar]);

    const handleMapClick = useCallback(() => {
        closeSideBar();
        setCenter(DEFAULT_CENTER);
        setZoom(DEFAULT_ZOOM);
    }, [closeSideBar]);

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
                        <MarkerIcon
                            key={inc.id ?? `${inc.lat}-${inc.lng}-${inc.date ?? ''}`}
                            incident={inc}
                            onClick={handleMarkerClick}
                        />
                    ))}
                </MapContainer>

                {/* Legenda (por estado) */}
                <div style={{
                    position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.92)', zIndex: 1000,
                    borderRadius: 8, padding: '6px 10px', boxShadow: '0 1px 3px rgba(0,0,0,.12)', fontSize: 12
                }}>
                    {Object.entries(STATUS_COLORS).map(([label, color]) => (
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
    fetchIncidents: PropTypes.func.isRequired,
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
    incidents: state.FMAIncidents || state.incidents || { incidents: [] },
    sideBarOpen: state.sideBarOpen,
});

const mapDispatchToProps = (dispatch) => ({
    fetchIncidents: () => dispatch(fetchIncidents()),
    sortIncidents: (...args) => dispatch(sortIncidents(...args)),
    openSideBar: (inc) => dispatch(openSideBar(inc)),
    closeSideBar: () => dispatch(closeSideBar()),
});

export default connect(mapStateToProps, mapDispatchToProps)(FMAMap);
