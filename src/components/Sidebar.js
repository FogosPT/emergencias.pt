import React from 'react';
import { connect } from 'react-redux';
import { LineChart, Line, XAxis, CartesianGrid, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
             data = this.props.sideBarOpen.incident.history.map((history) => (
               {
                   man: history.man,
                   aerial: history.aerial,
                   terrain: history.terrain,
                   date: history.created
               }
            ));

            data.push( {
                man: 0,
                aerial: 0,
                terrain: 0,
                date: this.props.sideBarOpen.incident.date
            })

            data.reverse();
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
                            <ResponsiveContainer className="h-10 w-full" width="100%" height="10rem"> 
                                <LineChart
                                    data={data}
                                    width="100%"
                                    height="100%"
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" label="Date" />
                                    <YAxis domain={['auto', 'auto']} />
                                    <Tooltip
                                    wrapperStyle={{
                                        borderColor: 'white',
                                        boxShadow: '2px 2px 3px 0px rgb(204, 204, 204)',
                                    }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#666666' }}
                                    />
                                    <Line dataKey="man" stroke="#ff7300" dot={false} />
                                    <Line dataKey="terrain" stroke="#666666" dot={false} />
                                    <Line dataKey="aerial" stroke="#666666" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
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
