import React, { useEffect } from "react";
import './App.css';
import Navbar from "./components/NavigationComponents";
import Footer from "./components/NavigationComponents/footer";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Quiz from './pages/quiz';
import Techniques from './pages/techniques';
import Kata from "./pages/kata";
import PerformanceMonitor from "./components/PerformanceMonitor";
import PerformanceDashboard from "./components/PerformanceDashboard";

function App() {
  useEffect(() => {
    // Redirect HTTPS to HTTP if the protocol is HTTPS
    if (window.location.protocol === "https:") {
      window.location.href = "http://" + window.location.hostname + window.location.pathname + window.location.search;
    }
  }, []);  // Empty dependency array ensures this runs only once, on component mount

  return (
    <Router>
      <PerformanceMonitor />
      <PerformanceDashboard />
      <Navbar />
      <Routes>
        <Route path="/" element={<Quiz />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/techniques" element={<Techniques />} />
        <Route path="/kata" element={<Kata />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
