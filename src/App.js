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
import AcceptInvite from "./pages/accept-invite";
import AcceptClubInvite from "./pages/accept-club-invite";
import NotFound from "./pages/not-found";
import TVShow from "./components/TVShow/TVShow";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LocalizedLanding from "./components/LocalizedLanding";

function App() {
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
          {/* The root serves English, but sends a visitor whose browser asks
              for Swedish on to /sv. Both pages stay separately indexable; see
              i18n/language.js for why the browser list and not the IP. */}
          <Route path="/" element={<LocalizedLanding />} />
          <Route path="/quiz" element={<Quiz lang="en" />} />
          {/* Swedish translation of the landing page. The ranking query is
              typed into google.se in Swedish, so it gets a real page. */}
          <Route path="/sv" element={<Quiz lang="sv" />} />
          <Route path="/techniques" element={<Techniques />} />
          <Route path="/kata" element={<Kata />} />
          <Route path="/randori" element={<RandoriTimer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/accept-club-invite" element={<AcceptClubInvite />} />
          <Route path="/tvshow/:token" element={<TVShow />} />
          <Route path="/account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
