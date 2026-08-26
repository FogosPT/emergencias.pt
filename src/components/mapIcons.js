import L from 'leaflet';

export const STATUS_COLORS = {
    'Em Curso':              '#ef4444',
    'Despacho':              '#f59e0b',
    'Despacho de 1º Alerta': '#f59e0b',
    'Chegada ao TO':         '#f59e0b',
    'Em Resolução':          '#22c55e',
    'Conclusão':             '#22c55e',
    'Vigilância':            '#3b82f6',
};

export const getStatusColor = (status) => STATUS_COLORS[status] || '#6b7280';

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

const GLYPH_RULES = [
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

export function getGlyphByNaturezaName(naturezaName = '') {
    const n = String(naturezaName).toLowerCase();
    for (const [re, g] of GLYPH_RULES) if (re.test(n)) return g;
    for (const k of Object.keys(GLYPHS)) if (n.includes(k)) return GLYPHS[k];
    return '⚠️';
}

export function makeIncidentIcon(incident = {}) {
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
        iconSize: [72, 72],
        iconAnchor: [36, 36],
        tooltipAnchor: [0, -36],
        popupAnchor: [0, -36],
    });
}
