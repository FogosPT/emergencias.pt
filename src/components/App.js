import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams
} from "react-router-dom";

import Home from './Home';
import Incident from './Incident';
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
              <Route path="/" element={<Home />} />
              <Route exact path="/incidente/:id" element={<HomeId />}/>
              <Route path="lista" element={<List />} />
            </Routes>
          </div>
      </Provider>
    );
  }
}

export default App;

function HomeId() {
  let params = useParams();
  return <Home id={params}/>;
}