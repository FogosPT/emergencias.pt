import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.addActiveClass = this.addActiveClass.bind(this);
        this.state = {
          active: false,
        };
      }
      addActiveClass() {
        const currentState = this.state.active;
        this.setState({
          active: !currentState
        });
      };

  render() {
    return (
        <nav className="top-0 z-50 bg-blue-500 fixed inset-x-0">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between">
                    <div className="flex space-x-4">
                        <div> 
                            <Link to="/" className="flex items-center py-5 px-2 text-white hover:text-gray-300"> <i className='bx bxl-medium-old mr-1 text-xl mb-1 text-white'></i> <span className="font-bold">Emergencias.pt</span> </Link> 
                        </div>
                        <div className="hidden md:flex items-center space-x-1"> 
                            <Link className="py-5 px-3 text-white hover:text-gray-300" to="/lista">Lista</Link>
                        </div>
                    </div>
                    <div className="md:hidden flex items-center"> 
                        <button className="mobile-menu-button focus:outline-none" onClick={this.addActiveClass.bind(this)}><i className='fas fa-bars bx bx-menu text-3xl mt-1'></i></button>
                    </div>
                </div>
            </div>
            <div className={this.state.active ? 'mobile-menu md:hidden' : 'mobile-menu hidden md:hidden'}> 
                <Link to="/" className="block py-2 px-4 text-sm hover:bg-gray-200" onClick={this.addActiveClass.bind(this)}>Início</Link> 
                <Link to="/lista" className="block py-2 px-4 text-sm hover:bg-gray-200" onClick={this.addActiveClass.bind(this)}>Sobre</Link> 
            </div>
        </nav>
    );
  }
}

export default NavBar;