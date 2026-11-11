import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { madeiraOccurrences, madeiraEvent } from '../store/madeiraSlice.js';
import { formatDateTime, formatTime, SOURCE_LABEL } from './madeiraFormat.js';

const REFRESH_MS = 60_000;
const { sort } = madeiraOccurrences.slice.actions;

const StatCard = ({ value, emoji, label, hint }) => (
    <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/5">
        <div className="overflow-hidden rounded-lg shadow-lg flex md:flex-col items-center md:justify-center p-4 gap-4 h-full">
            <div className="text-5xl">{emoji}</div>
            <div>
                <p className="text-5xl text-gray-800 md:text-center">{value}</p>
                <p className="text-sm md:text-center">{label}</p>
                {hint ? <p className="text-xs text-gray-500 md:text-center">{hint}</p> : null}
            </div>
        </div>
    </div>
);

const SectionTitle = ({ children }) => (
    <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-3">{children}</h2>
);

const TH = 'px-4 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider';
const TD = 'px-4 py-3 border-b border-gray-200 bg-white text-sm text-gray-900';

function EventSummary({ event }) {
    const kpi = event.kpi || {};
    const municipalities = Array.isArray(event.municipalities) ? event.municipalities : [];
    const roads = Array.isArray(event.roadRestrictions) ? event.roadRestrictions : [];
    const communiques = Array.isArray(event.communiques) ? event.communiques : [];
    const recommendations = Array.isArray(event.recommendations) ? event.recommendations : [];

    return (
        <section aria-labelledby="madeira-event-title" className="rounded-lg border border-blue-200 bg-blue-50 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
                <h2 id="madeira-event-title" className="text-xl md:text-2xl font-bold text-gray-900">{event.title}</h2>
                {event.status ? (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.active ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-gray-800'}`}>
                        {event.status}
                    </span>
                ) : null}
            </div>
            <p className="text-sm text-gray-700 mt-1">
                {event.zone ? <>{event.zone} · </> : null}
                Período: {formatDateTime(event.start)} – {event.untilNow ? 'em curso' : formatDateTime(event.end)}
                {' · '}Última atualização: {formatDateTime(event.updatedAt)}
            </p>
            {event.summary ? <p className="mt-3 text-gray-800">{event.summary}</p> : null}

            <div className="flex flex-wrap -mx-1 lg:-mx-4 mt-2">
                <StatCard value={kpi.occurrences ?? 0} emoji="🚨" label="Ocorrências no evento" />
                <StatCard value={kpi.activeOccurrences ?? 0} emoji="⏳" label="Ocorrências ativas" />
                <StatCard value={kpi.operationals ?? 0} emoji="👨‍🚒" label="Operacionais" />
                <StatCard value={kpi.groundAssets ?? 0} emoji="🚒" label="Meios terrestres" />
                <StatCard
                    value={kpi.municipalities ?? 0}
                    emoji="📍"
                    label="Concelhos afetados"
                    hint={kpi.peak ? `Pico: ${kpi.peak.occurrences} ocorrências às ${formatTime(kpi.peak.time)}` : null}
                />
            </div>

            {municipalities.length > 0 && (
                <>
                    <SectionTitle>Por concelho</SectionTitle>
                    <div className="overflow-x-auto shadow rounded-lg">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className={TH}>Concelho</th>
                                    <th className={TH}>Ocorrências</th>
                                    <th className={TH}>👩‍🚒</th>
                                    <th className={TH}>🚒</th>
                                    <th className={TH}>Naturezas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...municipalities]
                                    .sort((a, b) => (b.occurrences || 0) - (a.occurrences || 0))
                                    .map((m) => (
                                        <tr key={m.name}>
                                            <td className={TD}>{m.name}</td>
                                            <td className={TD}>{m.occurrences}</td>
                                            <td className={TD}>{m.operationals}</td>
                                            <td className={TD}>{m.groundAssets}</td>
                                            <td className={TD}>
                                                {(m.natures || []).map((n) => `${n.description} (${n.occurrences})`).join(' · ')}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {roads.length > 0 && (
                <>
                    <SectionTitle>Restrições rodoviárias</SectionTitle>
                    <ul className="space-y-2">
                        {roads.map((r, i) => (
                            <li key={`${r.road}-${i}`} className="bg-white rounded-lg shadow px-4 py-2 text-sm">
                                <span className={`mr-2 px-2 py-0.5 rounded-full text-xs font-semibold ${r.closed ? 'bg-red-200 text-red-900' : 'bg-yellow-200 text-yellow-900'}`}>
                                    {r.closed ? 'Cortada' : 'Condicionada'}
                                </span>
                                <strong>{r.road}</strong>
                                {r.text ? <> — {r.text}</> : null}
                                {r.time ? <span className="text-gray-500"> ({formatDateTime(r.time)})</span> : null}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {communiques.length > 0 && (
                <>
                    <SectionTitle>Comunicados</SectionTitle>
                    <ul className="space-y-3">
                        {communiques.map((c, i) => (
                            <li key={`${c.title}-${i}`} className="bg-white rounded-lg shadow px-4 py-3">
                                <p className="font-semibold text-gray-900">
                                    {c.title}
                                    {c.official ? <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-blue-200 text-blue-900">Oficial</span> : null}
                                </p>
                                {c.time ? <p className="text-xs text-gray-500">{formatDateTime(c.time)}</p> : null}
                                {c.text ? <p className="text-sm text-gray-700 mt-1">{c.text}</p> : null}
                                {c.link ? (
                                    <a className="text-sm text-blue-700 underline" href={c.link} target="_blank" rel="noopener noreferrer">
                                        Ler comunicado
                                    </a>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {recommendations.length > 0 && (
                <>
                    <SectionTitle>Recomendações</SectionTitle>
                    <ul className="list-disc pl-6 space-y-1 text-gray-800">
                        {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                </>
            )}

            {event.notes ? <p className="text-xs text-gray-500 mt-4">{event.notes}</p> : null}
        </section>
    );
}

const COLUMNS = [
    { field: 'start',         label: 'Início' },
    { field: 'nature',        label: 'Natureza' },
    { field: 'parish',        label: 'Freguesia' },
    { field: 'municipality',  label: 'Concelho' },
    { field: 'firefighters',  label: '👩‍🚒' },
    { field: 'vehicles',      label: '🚒' },
    { field: 'entitiesLabel', label: 'Corporações' },
];

export default function Madeira() {
    const dispatch = useDispatch();
    const occurrences = useSelector((s) => s.madeiraOccurrences);
    const event = useSelector((s) => s.madeiraEvent);
    const [lastSort, setLastSort] = useState(1);
    const [municipality, setMunicipality] = useState('all');

    useEffect(() => {
        const load = () => {
            dispatch(madeiraEvent.fetchThunk());
            dispatch(madeiraOccurrences.fetchThunk());
        };
        load();
        const id = setInterval(load, REFRESH_MS);
        return () => clearInterval(id);
    }, [dispatch]);

    const data = occurrences.data;
    const municipalities = useMemo(
        () => [...new Set(data.map((o) => o.municipality).filter(Boolean))].sort(),
        [data]
    );
    const filtered = useMemo(
        () => data.filter((o) => municipality === 'all' || o.municipality === municipality),
        [data, municipality]
    );
    const totals = useMemo(() => filtered.reduce(
        (acc, o) => ({
            count: acc.count + o.copies,
            firefighters: acc.firefighters + o.firefighters * o.copies,
            vehicles: acc.vehicles + o.vehicles * o.copies,
        }),
        { count: 0, firefighters: 0, vehicles: 0 }
    ), [filtered]);

    const sortTable = (field) => {
        dispatch(sort({ field, order: lastSort }));
        setLastSort((s) => -1 * s);
    };

    const showLoading = occurrences.loading && data.length === 0;

    return (
        <div className="shadow-lg mx-auto bg-white mt-24 md:mt-16 w-screen overflow-x-hidden">
            <div className="container md:my-12 mx-auto px-4 md:px-8 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Madeira</h1>
                    <Link to="/madeira-mapa" className="text-blue-700 underline text-sm">Ver no mapa</Link>
                </div>

                {event.data ? (
                    <EventSummary event={event.data} />
                ) : (
                    !event.loading && !event.error && (
                        <p className="rounded-lg bg-gray-100 px-4 py-3 text-gray-700">
                            Sem evento de tempo adverso ativo na Madeira.
                        </p>
                    )
                )}
                {event.error ? (
                    <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 mt-3 text-red-700">
                        {event.data
                            ? `Não foi possível atualizar o evento ativo: ${event.error}. A mostrar os últimos dados obtidos.`
                            : `Erro ao obter o evento ativo: ${event.error}`}
                    </p>
                ) : null}

                <SectionTitle>Ocorrências nas últimas 24 horas</SectionTitle>
                <div className="flex flex-wrap -mx-1 lg:-mx-4">
                    <StatCard value={totals.count} emoji="🚨" label="Ocorrências" />
                    <StatCard value={totals.firefighters} emoji="👨‍🚒" label="Operacionais" />
                    <StatCard value={totals.vehicles} emoji="🚒" label="Veículos" />
                </div>

                <div className="text-gray-700 md:flex md:items-center py-4">
                    <div className="mb-1 md:mb-0 md:w-1/5">
                        <label htmlFor="select-madeira-concelho">Concelho</label>
                    </div>
                    <div className="md:w-4/5 md:flex-grow">
                        <select
                            id="select-madeira-concelho"
                            className="w-full h-10 pl-3 pr-6 text-base border rounded-lg appearance-none focus:shadow-outline"
                            value={municipality}
                            onChange={(e) => setMunicipality(e.target.value)}
                        >
                            <option value="all">Todos</option>
                            {municipalities.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto shadow rounded-lg">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                {COLUMNS.map(({ field, label }) => (
                                    <th key={field} className={TH}>
                                        <button type="button" onClick={() => sortTable(field)}>{label}</button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {showLoading && (
                                <tr><td colSpan={COLUMNS.length} className="px-5 py-8 text-center text-gray-500 bg-white">A carregar…</td></tr>
                            )}
                            {occurrences.error && (
                                <tr><td role="alert" colSpan={COLUMNS.length} className="px-5 py-8 text-center text-red-600 bg-white">
                                    {data.length > 0
                                        ? `Não foi possível atualizar as ocorrências: ${occurrences.error}. A mostrar os últimos dados obtidos.`
                                        : occurrences.error}
                                </td></tr>
                            )}
                            {!showLoading && !occurrences.error && filtered.length === 0 && (
                                <tr><td colSpan={COLUMNS.length} className="px-5 py-8 text-center text-gray-500 bg-white">Sem ocorrências nas últimas 24 horas.</td></tr>
                            )}
                            {filtered.map((o) => (
                                <tr key={o.id}>
                                    <td className={`${TD} whitespace-nowrap`}>{formatDateTime(o.start)}</td>
                                    <td className={TD}>
                                        {o.nature}
                                        {o.copies > 1 ? <span className="ml-1 text-xs text-gray-500" title="Registos idênticos">×{o.copies}</span> : null}
                                    </td>
                                    <td className={`${TD} whitespace-nowrap`}>{o.parish || '—'}</td>
                                    <td className={`${TD} whitespace-nowrap`}>{o.municipality || '—'}</td>
                                    <td className={TD}>{o.firefighters}</td>
                                    <td className={TD}>{o.vehicles}</td>
                                    <td className={`${TD} whitespace-nowrap`}>{o.entitiesLabel || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                    {SOURCE_LABEL}. Horas locais da Madeira. Dados provisórios; as ocorrências não indicam estado (ativa/encerrada).
                </p>
            </div>
        </div>
    );
}
