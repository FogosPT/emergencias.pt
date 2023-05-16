import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchIncidents,sortIncidents } from '../actions/clientActions';

class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastSort: 1,
            district: 'all',
            concelho: 'all'
        };
    }

  componentWillMount() {
    this.props.fetchIncidents();
    const queryString = require('query-string');

    const parsed = queryString.parse(window.location.search);
    if(parsed.concelho){
        this.setState({concelho: parsed.concelho});
    }
}

  componentWillReceiveProps(nextProps) {
  }

  getStatusColor(status){
    switch(status){
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
            return 'relative inline-block px-3 py-1 font-semibold text-grey-900 leading-tight';
    }
  }

  getStatusColor2(status){
    switch(status){
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
            return 'absolute inset-0 bg-grey-200 opacity-50 rounded-full';
    }
  }

  sortTable(field){
    this.props.sortIncidents(field, this.state.lastSort);
    this.setState({
        lastSort: -1 * this.state.lastSort
    })
  }

  districtChange(event){
    this.setState({district: event.target.value});
  }

  concelhoChange(event){
    this.setState({concelho: event.target.value});
  } 

  render() {
    const distritos = this.props.incidents.incidents.map(item => item.district)
        .filter((value, index, self) => self.indexOf(value) === index);

    distritos.sort();

    const distritosOptions = distritos.map(distrito => (
        <option value={distrito}>{distrito}</option>
    ));

    const concelhos = this.props.incidents.incidents.map(item => item.concelho)
        .filter((value, index, self) => self.indexOf(value) === index);

    concelhos.sort();

    const concelhosOptions = concelhos.map(concelho => (
        <option value={concelho}>{concelho}</option>
    ));

    const incidents = this.props.incidents.incidents.map(incident => {
        if( this.state.district !== 'all' && this.state.concelho !== 'all' ){

            if(incident.district !== this.state.district || incident.concelho !== this.state.concelho){
                return;
            }
        } else{
            if(this.state.district !== 'all' ){
                if(incident.district !== this.state.district){
                    return;
                }
            } else if(this.state.concelho !== 'all'){
                if(incident.concelho !== this.state.concelho){
                    return;
                }
            }
        }

        return (
        <tr key={incident.id}>
             <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    {incident.date} {incident.hour}
                </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    <span className={this.getStatusColor(incident.status)}>
                        <span aria-hidden className={this.getStatusColor2(incident.status)}></span>
                    <span className="relative">{incident.status}</span></span>
                </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    {incident.district}
                </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    {incident.concelho}
                </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    {incident.freguesia}
                </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    {incident.localidade}
                </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    {incident.natureza}
                </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    {incident.man}
                </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    {incident.terrain}
                </p>
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    {incident.aerial}
                </p>
            </td>
 	    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p className="text-gray-900 whitespace-no-wrap">
                    {incident.meios_aquaticos}
                </p>
            </td>
        </tr>)
    });


    return (
        <div className="shadow-lg mx-auto bg-white mt-24 md:mt-16 h-screen">
             <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div class="text-gray-700 md:flex md:items-center p-4">
                    <div class="mb-1 md:mb-0 md:w-1/5">
                        <label for="forms-labelLeftInputCode">Distrito</label>
                    </div>
                    <div class="md:w-4/5 md:flex-grow">
                         <select className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" placeholder="Distrito" onChange={this.districtChange.bind(this)}>
                            <option value="all">Todos</option>
                            {distritosOptions}
                        </select>
                    </div>
                </div>

                <div class="text-gray-700 md:flex md:items-center p-4">
                    <div class="mb-1 md:mb-0 md:w-1/5">
                        <label for="forms-labelLeftInputCode">Concelho</label>
                    </div>
                    <div class="md:w-4/5 md:flex-grow">
                         <select className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" placeholder="Concelho" onChange={this.concelhoChange.bind(this)}>
                            <option value="all">Todos</option>
                            {concelhosOptions}
                        </select>
                    </div>
                </div>
            </div>
          <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
				<div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
					<table className="min-w-full leading-normal">
						<thead>
							<tr>
                                <th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									<button type="button" onClick={() => this.sortTable('dateTime')}>Início</button>
								</th>
                                <th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									<button type="button" onClick={() => this.sortTable('status')}>Estado</button>
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									<button type="button" onClick={() => this.sortTable('district')}>Distrito</button>
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('concelho')}>Concelho</button>
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <button type="button" onClick={() => this.sortTable('freguesia')}>Freguesia</button>
								</th>
                                <th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									<button type="button" onClick={() => this.sortTable('localidade')}>Localidade</button>
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									<button type="button" onClick={() => this.sortTable('natureza')}>Natureza</button>
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									<button type="button" onClick={() => this.sortTable('man')}>👩‍🚒</button>
								</th>
                                <th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									<button type="button" onClick={() => this.sortTable('terrain')}>🚒</button>
								</th>
                                <th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									<button type="button" onClick={() => this.sortTable('aerial')}>🚁</button>
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									<button type="button" onClick={() => this.sortTable('meios_aquaticos')}>🏊</button>
								</th>
							</tr>
						</thead>
						<tbody>
                            {incidents}
                        </tbody>
                    </table>
                </div>
            </div>
      </div>
    );
  }
}

List.propTypes = {
  fetchIncidents: PropTypes.func.isRequired,
  incidents: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  incidents: state.incidents,
});

export default connect(mapStateToProps, { fetchIncidents, sortIncidents })(List);
