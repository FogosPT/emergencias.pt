import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useLocation
} from "react-router-dom";

import NavBar from './navbar';
import { Provider } from 'react-redux';
import store from '../store';
import SideBar from './Sidebar';
import List from './List';
import FMA from "./FMA";

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App flex flex-no-wrap">
            <NavBar />
            <SideBar />
            <Routes>
              <Route path="/" element={<List />} />
              <Route path="fma" element={<FMA />} />
              <Route path="lista" element={<List />} />
              <Route path="map" element={<Home />} />
            </Routes>
          </div>
      </Provider>
    );
  }
}

export default App;