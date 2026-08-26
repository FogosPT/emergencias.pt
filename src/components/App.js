import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../store';
import NavBar from './navbar';
import List from './List';
import FMA from './FMA';
import FMAMap from './FMAMap';
import AllMap from './AllMap';

export default function App() {
    return (
        <Provider store={store}>
            <div className="App flex flex-no-wrap">
                <NavBar />
                <Routes>
                    <Route path="/" element={<List />} />
                    <Route path="fma" element={<FMA />} />
                    <Route path="lista" element={<List />} />
                    <Route path="fma-mapa" element={<FMAMap />} />
                    <Route path="mapa" element={<AllMap />} />
                </Routes>
            </div>
        </Provider>
    );
}
