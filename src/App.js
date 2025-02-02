import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import Navigation from "./components/Layout/Navbar";
import SittingRequests from "./components/SittingRequests";
import Notifications from "./pages/Notifications";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import './App.css';

const isAuthenticated = !!localStorage.getItem("accessToken");

console.log("🚀 Posts importiert:", Posts);

const App = () => {
  return (
    <Router>
      <Navigation /> {/* Navbar integration */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/sitting-requests" element={<SittingRequests />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
