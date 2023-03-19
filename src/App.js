import React from "react";
import './App.css';
import Navbar from "./components/NavigationComponents";
import Footer from "./components/NavigationComponents/footer";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Quiz from './pages/quiz';
import Techniques from './pages/techniques';
import Kata from "./pages/kata";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Quiz />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/techniques" element={<Techniques />} />
        <Route path="/kata" element={<Kata />} />
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
