// The API sends UTC ISO strings ending in `Z`. Madeira follows the same
// offset as mainland Portugal (WET/WEST), so local time is shown in that zone.
const TIME_ZONE = 'Atlantic/Madeira';

const dateTimeFmt = new Intl.DateTimeFormat('pt-PT', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
});

const timeFmt = new Intl.DateTimeFormat('pt-PT', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
});

const toDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
};

/** "11/11, 12:09" in Madeira local time, or "—" when missing/invalid. */
export function formatDateTime(iso) {
    const d = toDate(iso);
    return d ? dateTimeFmt.format(d) : '—';
}

/** "12:09" in Madeira local time, or "—" when missing/invalid. */
export function formatTime(iso) {
    const d = toDate(iso);
    return d ? timeFmt.format(d) : '—';
}

export const SOURCE_LABEL = 'Fonte: SRPC, IP-RAM (via Fogos.pt)';
export const APPROX_LOCATION_LABEL = 'Localização aproximada (freguesia)';

export const placeLabel = (o) => (
    [o?.parish, o?.municipality].filter(Boolean).join(', ') || 'Local não indicado'
);
