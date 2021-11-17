import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchIncidents } from '../actions/clientActions';

class Incidents extends Component {
  componentWillMount() {
    this.props.fetchIncidents();
    console.log( 3333,this.props);
  }

  componentWillReceiveProps(nextProps) {
    console.log(222,nextProps);
  }

  render() {
    const postItems = this.props.incidents.incidents.map(incident => (
      <div key={incident.id}>
        <h3>{incident.location}</h3>
        <p>{incident.natureza}</p>
      </div>
    ));
    return (
      <div>
        <h1>Posts</h1>
        {postItems}
      </div>
    );
  }
}

Incidents.propTypes = {
  fetchIncidents: PropTypes.func.isRequired,
  incidents: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  incidents: state.incidents,
});

export default connect(mapStateToProps, { fetchIncidents })(Incidents);