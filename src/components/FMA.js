// components/List.jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchFMAIncidents, sortIncidents } from '../actions/clientActions';
import queryString from 'query-string';

class FMA extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastSort: 1,
            district: 'all',
            concelho: 'all',
        };
    }

    componentDidMount() {
        this.props.fetchFMAIncidents?.();

        const parsed = queryString.parse(window.location.search);
        if (parsed.concelho) {
            this.setState({ concelho: parsed.concelho });
        }
    }

    getStatusColor(status) {
        switch (status) {
            case 'Chegada ao TO':
            case 'Despacho de 1º Alerta':
            case 'Despacho':
                return 'relative inline-block px-3 py-1 font-semibold text-yellow-900 leading-tight';
            case 'Em Curso':
                return 'relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight';
            case 'Conclusão':
            case 'Em Resolução':
                return 'relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight';
            case 'Vigilância':
                return 'relative inline-block px-3 py-1 font-semibold text-blue-900 leading-tight';
            default:
                return 'relative inline-block px-3 py-1 font-semibold text-gray-900 leading-tight';
        }
    }

    getStatusColor2(status) {
        switch (status) {
            case 'Chegada ao TO':
            case 'Despacho de 1º Alerta':
            case 'Despacho':
                return 'absolute inset-0 bg-yellow-200 opacity-50 rounded-full';
            case 'Em Curso':
                return 'absolute inset-0 bg-red-200 opacity-50 rounded-full';
            case 'Conclusão':
            case 'Em Resolução':
                return 'absolute inset-0 bg-green-200 opacity-50 rounded-full';
            case 'Vigilância':
                return 'absolute inset-0 bg-blue-200 opacity-50 rounded-full';
            default:
                return 'absolute inset-0 bg-gray-200 opacity-50 rounded-full';
        }
    }

    sortTable = (field) => {
        this.props.sortIncidents?.(field, this.state.lastSort);
        this.setState((s) => ({ lastSort: -1 * s.lastSort }));
    };

    districtChange = (e) => this.setState({ district: e.target.value });
    concelhoChange = (e) => this.setState({ concelho: e.target.value });

    render() {
        // 1) Buscar array com guard: state.incidents.incidents (do reducer acima)
        const incoming = Array.isArray(this.props.incidents?.incidents)
            ? this.props.incidents.incidents
            : [];

        // 2) Normalizar campos possíveis da API
        const data = incoming.map((i) => ({
            ...i,
            district: i.district ?? i.distrito ?? i.District,
            concelho: i.concelho ?? i.municipio ?? i.Municipio,
            sub_regiao: i.sub_regiao ?? i.subRegiao ?? i.subregion,
            freguesia: i.freguesia ?? i.Freguesia,
            localidade: i.localidade ?? i.Localidade,
            natureza: i.natureza ?? i.Natureza,
            man: Number(i.man ?? i.operacionais ?? 0),
            terrain: Number(i.terrain ?? i.veiculos ?? 0),
            aerial: Number(i.aerial ?? i.aereos ?? 0),
            meios_aquaticos: Number(i.meios_aquaticos ?? i.aquaticos ?? 0),
            id: i.id ?? i.uid ?? `${i.district}-${i.concelho}-${i.date}-${i.hour}`,
        }));

        // 3) Dropdowns únicos
        const distritos = [...new Set(data.map((x) => x.district).filter(Boolean))].sort();
        const concelhos = [...new Set(data.map((x) => x.concelho).filter(Boolean))].sort();

        // 4) Filtro
        const filtered = data.filter((i) => {
            const byD = this.state.district === 'all' || i.district === this.state.district;
            const byC = this.state.concelho === 'all' || i.concelho === this.state.concelho;
            return byD && byC;
        });

        // 5) Totais (sem mutar state no render)
        const totals = filtered.reduce(
            (acc, i) => {
                acc.totalIncidents += 1;
                acc.totalMan += i.man || 0;
                acc.totalTerrain += i.terrain || 0;
                acc.totalAerial += i.aerial || 0;
                acc.totalBoat += i.meios_aquaticos || 0;
                return acc;
            },
            { totalIncidents: 0, totalMan: 0, totalTerrain: 0, totalAerial: 0, totalBoat: 0 }
        );

        // 6) Rows
        const rows =
            filtered.length > 0 ? (
                filtered.map((incident) => (
                    <tr key={incident.id}>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">{incident.date} {incident.hour}</p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                <span className={this.getStatusColor(incident.status)}>
                  <span aria-hidden="true" className={this.getStatusColor2(incident.status)}></span>
                  <span className="relative">{incident.status}</span>
                </span>
                            </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{incident.sub_regiao}</p></td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{incident.district}</p></td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{incident.concelho}</p></td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{incident.freguesia}</p></td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{incident.localidade}</p></td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{incident.natureza}</p></td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{incident.man}</p></td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{incident.terrain}</p></td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{incident.aerial}</p></td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{incident.meios_aquaticos}</p></td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={13} className="px-5 py-8 text-center text-gray-500 bg-white">
                        Sem ocorrências para os filtros atuais.
                    </td>
                </tr>
            );

        return (
            <div className="shadow-lg mx-auto bg-white mt-24 md:mt-16 h-screen">
                <div className="container my-12 mx-auto px-4 md:px-12">
                    <div className="flex flex-wrap -mx-1 lg:-mx-4">
                        <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/5">
                            <div className="overflow-hidden rounded-lg shadow-lg">
                                <header className="flex items-center justify-between leading-tight p-2 md:p-4 place-content-center">
                                    <p className="text-gray-800 text-6xl text-center">{totals.totalIncidents} 🚨</p>
                                </header>
                                <footer className="flex items-center justify-between leading-none p-2 md:p-4 place-content-center">
                                    <p className="text-center text-sm">Total Ocorrências</p>
                                </footer>
                            </div>
                        </div>

                        <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/5">
                            <div className="overflow-hidden rounded-lg shadow-lg">
                                <header className="flex items-center justify-between leading-tight p-2 md:p-4 place-content-center">
                                    <p className="text-gray-800 text-6xl text-center">{totals.totalMan} 👨‍🚒</p>
                                </header>
                                <footer className="flex items-center justify-between leading-none p-2 md:p-4 place-content-center">
                                    <p className="text-center text-sm">Total Operacionais</p>
                                </footer>
                            </div>
                        </div>

                        <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/5">
                            <div className="overflow-hidden rounded-lg shadow-lg">
                                <header className="flex items-center justify-between leading-tight p-2 md:p-4 place-content-center">
                                    <p className="text-gray-800 text-6xl text-center">{totals.totalTerrain} 🚒</p>
                                </header>
                                <footer className="flex items-center justify-between leading-none p-2 md:p-4 place-content-center">
                                    <p className="text-center text-sm">Total Veículos</p>
                                </footer>
                            </div>
                        </div>

                        <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/5">
                            <div className="overflow-hidden rounded-lg shadow-lg">
                                <header className="flex items-center justify-between leading-tight p-2 md:p-4 place-content-center">
                                    <p className="text-gray-800 text-6xl text-center">{totals.totalAerial} 🚁</p>
                                </header>
                                <footer className="flex items-center justify-between leading-none p-2 md:p-4 place-content-center">
                                    <p className="text-center text-sm">Total Aéreos</p>
                                </footer>
                            </div>
                        </div>

                        <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/5">
                            <div className="overflow-hidden rounded-lg shadow-lg">
                                <header className="flex items-center justify-between leading-tight p-2 md:p-4 place-content-center">
                                    <p className="text-gray-800 text-6xl text-center">{totals.totalBoat} 🚣</p>
                                </header>
                                <footer className="flex items-center justify-between leading-none p-2 md:p-4 place-content-center">
                                    <p className="text-center text-sm">Total Aquáticos</p>
                                </footer>
                            </div>
                        </div>
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
                                onChange={this.districtChange}
                                value={this.state.district}
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
                                onChange={this.concelhoChange}
                                value={this.state.concelho}
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
                    <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('dateTime')}>Início</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('status')}>Estado</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('sub_regiao')}>Sub região</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('district')}>Distrito</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('concelho')}>Concelho</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('freguesia')}>Freguesia</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('localidade')}>Localidade</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('natureza')}>Natureza</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('man')}>👩‍🚒</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('terrain')}>🚒</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('aerial')}>🚁</button>
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('meios_aquaticos')}>🚣</button>
                                </th>
                            </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

FMA.propTypes = {
    fetchFMAIncidents: PropTypes.func.isRequired,
    sortIncidents: PropTypes.func,
    incidents: PropTypes.shape({
        incidents: PropTypes.array, // <- reducer garante isto
        loading: PropTypes.bool,
        error: PropTypes.any,
    }).isRequired,
};

const mapStateToProps = (state) => ({
    incidents: state.incidents || { incidents: [] },
});

export default connect(mapStateToProps, { fetchFMAIncidents, sortIncidents })(FMA);
