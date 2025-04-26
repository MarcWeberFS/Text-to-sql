import './App.css';
import Main from './pages/main';
import Benchmark from './pages/benchmark';
import BenchmarkCase from './pages/benchmark-case';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/benchmark" element={<Benchmark />} />
        <Route path="/case/:id" element={<BenchmarkCase />} />
      </Routes>
    </Router>
  );
}

export default App;
