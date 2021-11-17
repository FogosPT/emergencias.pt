import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Home from './Home';
import Incident from './Incident';
import NavBar from './navbar';
import { Provider } from 'react-redux';
import store from '../store';
import SideBar from './Sidebar';


class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App flex flex-no-wrap">
            <NavBar />
            <SideBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="lista" element={<Incident />} />
            </Routes>
          </div>
      </Provider>
    );
  }
}

export default App;