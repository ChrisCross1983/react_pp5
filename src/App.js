import './App.css';
import React from "react";
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import Navigation from "./components/Layout/Navbar";
import Home from "./pages/Home";

const isAuthenticated = !!localStorage.getItem("accessToken");
const App = () => {
  return (
    <Router>
      <Navigation /> {/* Navbar integrated */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
