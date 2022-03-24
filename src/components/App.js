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

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App flex flex-no-wrap">
            <NavBar />
            <SideBar />
            <Routes>
              <Route path="/" element={<List />} />
              <Route path="lista" element={<List />} />
            </Routes>
          </div>
      </Provider>
    );
  }
}

export default App;