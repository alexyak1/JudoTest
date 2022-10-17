import React from "react";
import './App.css';
import Navbar from "./components/NavigationComponents";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './pages';
import Quiz from './pages/quiz';
import Techniques from './pages/techniques';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Quiz />} />
        <Route path="/home" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/techniques" element={<Techniques />} />
      </Routes>
    </Router>
  );
}

export default App;
