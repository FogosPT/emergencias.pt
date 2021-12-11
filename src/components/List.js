import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchIncidents } from '../actions/clientActions';

class List extends Component {
  componentWillMount() {
    this.props.fetchIncidents();
    console.log( 3333,this.props);
  }

  componentWillReceiveProps(nextProps) {
    console.log(222,nextProps);
  }

  getStatusColor(status){
    switch(status){
        case 'Chegada ao TO':
        case 'Despacho de 1º Alerta':
            return 'relative inline-block px-3 py-1 font-semibold text-yellow-900 leading-tight';
        case 'Em Curso':
            return 'relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight';
        case 'Conclusão':
        case 'Em Resolução':
            return 'relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight';
        default:
            return 'relative inline-block px-3 py-1 font-semibold text-grey-900 leading-tight';
    }
  }

  getStatusColor2(status){
      console.log(status);
    switch(status){
        case 'Chegada ao TO':
        case 'Despacho de 1º Alerta':
            return 'absolute inset-0 bg-yellow-200 opacity-50 rounded-full';
        case 'Em Curso':
            return 'absolute inset-0 bg-red-200 opacity-50 rounded-full';
        case 'Conclusão':
        case 'Em Resolução':
            return 'absolute inset-0 bg-green-200 opacity-50 rounded-full';
        default:
            return 'absolute inset-0 bg-grey-200 opacity-50 rounded-full';
    }
  }

  render() {
    const incidents = this.props.incidents.incidents.map(incident => (
        <tr key={incident.id}>
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
        </tr>
    ));
    return (
        <div className="shadow-lg mx-auto bg-white mt-24 md:mt-16 h-screen">
          <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
				<div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
					<table className="min-w-full leading-normal">
						<thead>
							<tr>
                                <th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Estado
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Distrito
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Concelho
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Freguesia
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Natureza
								</th>
								<th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									👩‍🚒
								</th>
                                <th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									🚒
								</th>
                                <th
									className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									🚁
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

export default connect(mapStateToProps, { fetchIncidents })(List);