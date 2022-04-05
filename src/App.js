import React from "react";
import './App.css';
import Navbar from "./components/Navbar";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './pages';
import Test from './pages/test';
import Techniques from './pages/techniques';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/techniques" element={<Techniques />} />
      </Routes>
    </Router>
  );
}

export default App;
