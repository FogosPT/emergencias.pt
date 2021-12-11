import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchIncidents, fetchIncident } from '../actions/clientActions';
import { openSideBar, closeSideBar } from '../actions/sideBarActions';
import ReactMapboxGl, { Layer, Feature, ZoomControl, ScaleControl } from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';


const Map = ReactMapboxGl({
    accessToken: 'pk.eyJ1IjoiZm9nb3NwdCIsImEiOiJjamZ3Y2E5OTMyMjFnMnFxbjAxbmt3bmdtIn0.xg1X-A17WRBaDghhzsmjIA',
    center: [-8.96362824293375, 39.4392129215951],
});

class Home extends Component {
    state = {
        fitBounds: undefined,
        center: [-8.96362824293375, 39.4392129215951],
        zoom: [8],
        incident: {},
        incidents: {},
        sideBarOpen: false
    };

  componentWillMount() {
    this.props.fetchIncidents();

    if(this.props.id){
        const id = this.props.id.id;
        this.props.fetchIncident(id);
    }
  }
  
  componentWillUnmount() {
    this.props.closeSideBar();

    this.setState({
        fitBounds: undefined,
        center: [-8.96362824293375, 39.4392129215951],
        zoom: [8],
        incident: {},
        incidents: {},
        sideBarOpen: false
      });
}

  componentWillReceiveProps(nextProps) {
    if(nextProps.incidents.incident){
        this.setState({
            center: [nextProps.sideBarOpen.incident.lng, nextProps.sideBarOpen.incident.lat],
            zoom: [14],
            incident: nextProps.sideBarOpen.incident,
            sideBarOpen: true
          });
      
    }
  }
  
  onToggleHover(cursor, { map }) {
    map.getCanvas().style.cursor = cursor;
  }

  markerClick = (incident, dispatch) => {
    this.setState({
      center: [incident.lng, incident.lat],
      zoom: [14],
      incident: incident,
      sideBarOpen: true
    });

    this.props.openSideBar(incident);
  };

  mapClick = (dispatch) => {
    this.props.closeSideBar();
    this.setState({
        fitBounds: undefined,
        center: [-8.96362824293375, 39.4392129215951],
        zoom: [8],
        incident: {},
        incidents: {},
        sideBarOpen: false
      });
  };

  mapDispatchToProps = dispatch => ( {
    openSideBar: (incident) => dispatch( openSideBar(incident) ),
    closeSideBar: () => dispatch( closeSideBar() )

  } )
  
  mapStateToProps = ( state ) => ( {
    sideBarOpen: state.sideBarOpen,
    incident: state.incident
  } )

  getCirclePaint = () => ({
    'circle-radius': 5,
    'circle-color': '#E54E52',
    'circle-opacity': 0.8
  });

  render() {
    return (
      <div className="shadow-lg mx-auto bg-white mt-24 md:mt-16 h-screen">
        <Map
            className="h-screen"
            style="mapbox://styles/fogospt/ckw28xgdr3onn14o5qirdfic9"
            containerStyle={{
                height: '100vh',
                width: '100vw'
            }}
            center={this.state.center}
            zoom={this.state.zoom}
            onClick={this.mapClick.bind(this)}
            >
            <ScaleControl />
            <ZoomControl />
            <Layer type="symbol" id="marker" layout={{ 'icon-image': 'mapbox-marker-icon-blue' }}>
                {this.props.incidents.incidents.map((incident) => (
                    <Feature
                        key={incident}
                        onMouseEnter={this.onToggleHover.bind(this, 'pointer')}
                        onMouseLeave={this.onToggleHover.bind(this, '')}
                        onClick={this.markerClick.bind(this, incident)}
                        coordinates={[incident.lng, incident.lat]}
                    />
                ))}
        </Layer>
        </Map>
      </div>
    );
  }
}

Home.propTypes = {
  fetchIncidents: PropTypes.func.isRequired,
  fetchIncident: PropTypes.func.isRequired,
  openSideBar: PropTypes.func.isRequired,
  closeSideBar: PropTypes.func.isRequired,
  incidents: PropTypes.object.isRequired,
  incident: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  incidents: state.incidents,
  sideBarOpen: state.sideBarOpen,
  incident: state.incident
});

export default connect(mapStateToProps, { fetchIncidents, fetchIncident, openSideBar, closeSideBar })(Home);