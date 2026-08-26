import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import queryString from 'query-string';
import { allIncidents } from '../store/incidentsSlice.js';

const { fetchThunk, slice } = allIncidents;
const { sort } = slice.actions;

const STATUS_STYLES = {
    'Chegada ao TO':        { text: 'text-yellow-900', bg: 'bg-yellow-200' },
    'Despacho de 1º Alerta':{ text: 'text-yellow-900', bg: 'bg-yellow-200' },
    'Despacho':             { text: 'text-yellow-900', bg: 'bg-yellow-200' },
    'Em Curso':             { text: 'text-red-900',    bg: 'bg-red-200' },
    'Conclusão':            { text: 'text-green-900',  bg: 'bg-green-200' },
    'Em Resolução':         { text: 'text-green-900',  bg: 'bg-green-200' },
    'Vigilância':           { text: 'text-blue-900',   bg: 'bg-blue-200' },
};

const statusPill = (status) => {
    const s = STATUS_STYLES[status] || { text: 'text-gray-900', bg: 'bg-gray-200' };
    return (
        <span className={`relative inline-block px-3 py-1 font-semibold ${s.text} leading-tight`}>
            <span aria-hidden="true" className={`absolute inset-0 ${s.bg} opacity-50 rounded-full`} />
            <span className="relative">{status}</span>
        </span>
    );
};

const StatCard = ({ value, emoji, label }) => (
    <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/5">
        <div className="overflow-hidden rounded-lg shadow-lg flex md:flex-col items-center md:justify-center p-4 gap-4">
            <div className="text-6xl">{emoji}</div>
            <div>
                <p className="text-6xl text-gray-800 md:text-center">{value}</p>
                <p className="text-sm">{label}</p>
            </div>
        </div>
    </div>
);

const COLUMNS = [
    { field: 'dateTime',        label: 'Início' },
    { field: 'status',          label: 'Estado' },
    { field: 'sub_regiao',      label: 'Sub região' },
    { field: 'district',        label: 'Distrito' },
    { field: 'concelho',        label: 'Concelho' },
    { field: 'freguesia',       label: 'Freguesia' },
    { field: 'localidade',      label: 'Localidade' },
    { field: 'natureza',        label: 'Natureza' },
    { field: 'man',             label: '👩‍🚒' },
    { field: 'terrain',         label: '🚒' },
    { field: 'aerial',          label: '🚁' },
    { field: 'meios_aquaticos', label: '🚣' },
];

export default function List() {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((s) => s.allIncidents);

    const [lastSort, setLastSort] = useState(1);
    const [district, setDistrict] = useState('all');
    const [concelho, setConcelho] = useState('all');

    useEffect(() => {
        dispatch(fetchThunk());
        const parsed = queryString.parse(window.location.search);
        if (parsed.concelho) setConcelho(parsed.concelho);
    }, [dispatch]);

    const distritos = useMemo(
        () => [...new Set(data.map((i) => i.district).filter(Boolean))].sort(),
        [data]
    );
    const concelhos = useMemo(
        () => [...new Set(data.map((i) => i.concelho).filter(Boolean))].sort(),
        [data]
    );

    const filtered = useMemo(
        () => data.filter((i) => (
            (district === 'all' || i.district === district) &&
            (concelho === 'all' || i.concelho === concelho)
        )),
        [data, district, concelho]
    );

    const totals = useMemo(() => filtered.reduce(
        (acc, i) => ({
            totalIncidents: acc.totalIncidents + 1,
            totalMan:       acc.totalMan + (Number(i.man) || 0),
            totalTerrain:   acc.totalTerrain + (Number(i.terrain) || 0),
            totalAerial:    acc.totalAerial + (Number(i.aerial) || 0),
            totalBoat:      acc.totalBoat + (Number(i.meios_aquaticos) || 0),
        }),
        { totalIncidents: 0, totalMan: 0, totalTerrain: 0, totalAerial: 0, totalBoat: 0 }
    ), [filtered]);

    const sortTable = (field) => {
        dispatch(sort({ field, order: lastSort }));
        setLastSort((s) => -1 * s);
    };

    return (
        <div className="shadow-lg mx-auto bg-white mt-24 md:mt-16 w-screen overflow-x-hidden">
            <div className="container md:my-12 mx-auto px-4 md:px-8">
                <div className="flex flex-wrap -mx-1 lg:-mx-4">
                    <StatCard value={totals.totalIncidents} emoji="🚨" label="Total Ocorrências" />
                    <StatCard value={totals.totalMan}       emoji="👨‍🚒" label="Total Operacionais" />
                    <StatCard value={totals.totalTerrain}   emoji="🚒" label="Total Veículos" />
                    <StatCard value={totals.totalAerial}    emoji="🚁" label="Total Aéreos" />
                    <StatCard value={totals.totalBoat}      emoji="🚣" label="Total Aquáticos" />
                </div>
            </div>

            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div className="text-gray-700 md:flex md:items-center p-4">
                    <div className="mb-1 md:mb-0 md:w-1/5">
                        <label htmlFor="select-distrito">Distrito</label>
                    </div>
                    <div className="md:w-4/5 md:flex-grow">
                        <select
                            id="select-distrito"
                            className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                        >
                            <option value="all">Todos</option>
                            {distritos.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="text-gray-700 md:flex md:items-center p-4">
                    <div className="mb-1 md:mb-0 md:w-1/5">
                        <label htmlFor="select-concelho">Concelho</label>
                    </div>
                    <div className="md:w-4/5 md:flex-grow">
                        <select
                            id="select-concelho"
                            className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                            value={concelho}
                            onChange={(e) => setConcelho(e.target.value)}
                        >
                            <option value="all">Todos</option>
                            {concelhos.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div className="inline-block min-w-full shadow rounded-lg overflow-x-scroll max-w-full">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                {COLUMNS.map(({ field, label }) => (
                                    <th
                                        key={field}
                                        className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                    >
                                        <button type="button" onClick={() => sortTable(field)}>{label}</button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={COLUMNS.length} className="px-5 py-8 text-center text-gray-500 bg-white">A carregar…</td></tr>
                            )}
                            {error && (
                                <tr><td colSpan={COLUMNS.length} className="px-5 py-8 text-center text-red-600 bg-white">{error}</td></tr>
                            )}
                            {!loading && !error && filtered.length === 0 && (
                                <tr><td colSpan={COLUMNS.length} className="px-5 py-8 text-center text-gray-500 bg-white">Sem ocorrências para os filtros atuais.</td></tr>
                            )}
                            {filtered.map((incident) => (
                                <tr key={incident.id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-nowrap">{incident.date} {incident.hour}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-nowrap">{statusPill(incident.status)}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-nowrap">{incident.sub_regiao}</p></td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-nowrap">{incident.district}</p></td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-nowrap">{incident.concelho}</p></td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-nowrap">{incident.freguesia}</p></td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-nowrap">{incident.localidade}</p></td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-nowrap">{incident.natureza}</p></td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-nowrap">{incident.man}</p></td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-nowrap">{incident.terrain}</p></td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-nowrap">{incident.aerial}</p></td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-nowrap">{incident.meios_aquaticos}</p></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
