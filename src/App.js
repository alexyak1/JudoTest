import React from "react";
import './App.css';
import Navbar from "./components/NavigationComponents";
import Footer from "./components/NavigationComponents/footer";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Quiz from './pages/quiz';
import Techniques from './pages/techniques';
import Kata from "./pages/kata";
import RandoriTimer from "./pages/randori";
import Login from "./pages/login";
import Register from "./pages/register";
import Account from "./pages/account";
import Verify from "./pages/verify";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  useEffect(() => {
    // Redirect HTTPS to HTTP if the protocol is HTTPS
    if (window.location.protocol === "https:") {
      window.location.href = "http://" + window.location.hostname + window.location.pathname + window.location.search;
    }
  }, []);  // Empty dependency array ensures this runs only once, on component mount

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Quiz />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/techniques" element={<Techniques />} />
          <Route path="/kata" element={<Kata />} />
          <Route path="/randori" element={<RandoriTimer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
