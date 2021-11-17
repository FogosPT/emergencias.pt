import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine, ReferenceArea,
    ReferenceDot, Tooltip, CartesianGrid, Legend, Brush, ErrorBar, AreaChart, Area,
    Label, LabelList } from 'recharts';

class SideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sideBarOpen: false,
            incident: undefined,
        };
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    }

    onSetSidebarOpen(open) {
        this.setState({ sideBarOpen: true });
    }

    render() {
        let data = {};
        if(this.props.sideBarOpen.incident){
            console.log(this.props.sideBarOpen.incident.history);        
             data = this.props.sideBarOpen.incident.history.map((history) => (
               {
                   man: history.man,
                   aerial: history.aerial,
                   terrain: history.terrain,
                   date: history.created
               }
            ));
        }
      

        return (
            <div>
                {/* Sidebar starts */}
                {/* Remove class [ hidden ] and replace [ sm:flex ] with [ flex ] */}
                <div className={this.props.sideBarOpen.sideBarOpen? "mt-24 md:mt-16 w-96 absolute sm:relative bg-white shadow md:h-full flex-col justify-between" : "mt-24 md:mt-16 w-96 absolute sm:relative bg-white shadow md:h-full flex-col justify-between hidden"}>
                    {this.props.sideBarOpen.incident ?
                    <div>
                        <div className="border shadow p-8">
                            <h3 className="text-blue-600 text-3xl font-bold">Local</h3>
                            <p>{this.props.sideBarOpen.incident.location}</p>
                            <h3 className="text-blue-600 text-3xl font-bold mt-3.5">Início</h3>
                            <p>{this.props.sideBarOpen.incident.date}:{this.props.sideBarOpen.incident.hour}</p>
                            <h3 className="text-blue-600 text-3xl font-bold mt-3.5">Tipo</h3>
                            <p>{this.props.sideBarOpen.incident.familiaName} - {this.props.sideBarOpen.incident.especieName}</p>
                            <h3 className="text-blue-600 text-3xl font-bold mt-3.5">Sub Tipo</h3>
                            <p>{this.props.sideBarOpen.incident.natureza}</p>
                        </div>

                        <div className="border shadow p-8 mt-3.5">
                            <h3 className="text-blue-600 text-3xl font-bold">Meios</h3>
                            <div className="max-w-7xl mx-auto grid grid-cols-12 mt-3.5 text-center">
                                <div className="col-span-4">
                                    <p><span>👩‍🚒</span><span>{this.props.sideBarOpen.incident.man}</span></p>
                                </div>
                                <div className="col-span-4">
                                    <p><span>🚒</span><span>{this.props.sideBarOpen.incident.terrain}</span></p>
                                </div>
                                <div className="col-span-4">
                                    <p><span>🚁</span><span>{this.props.sideBarOpen.incident.aerial}</span></p>
                                </div>
                            </div>
                            <div className='line-chart-wrapper' style={{ padding: 40 }}>
                                <LineChart
                                    className="max-w-7xl mx-auto grid grid-cols-12 mt-3.5 text-center"
                                    data={data}
                                >
                                    <XAxis dataKey='man' />
                                    <CartesianGrid stroke='#f5f5f5'/>
                                    <Brush />
                                    <Tooltip filterNull={false} />
                                    <Line
                                    type="monotone"
                                    key="0"
                                    dataKey="man"
                                    stroke="#ff7300"
                                    strokeWidth={5}
                                    yAxisId={0}
                                    activeDot={{ onClick: this.handleClickDot }}
                                    onClick={this.handleLineClick}
                                    />
                                    {this.state.newLine && <Line type='monotone' key={'1'} dataKey='man' stroke='#132908' yAxisId={1} activeDot={{fill: '#132908', stroke: 'none', r: 6}}/>}
                                    <Line type='monotone' key={'2'} dataKey='aerial' stroke='#387908' yAxisId={1} activeDot={{fill: '#387908', stroke: 'none', r: 6}}/>
                                </LineChart>
                            </div>
                        </div>
                    </div>
                    :''}
                </div>
            </div>
        );
    }
}

const mapStateToProps = ( state ) => ( {
    sideBarOpen: state.sideBarOpen,
    incident: state.incident
  } )

export default connect( mapStateToProps, null )( SideBar )
