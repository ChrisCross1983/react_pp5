import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import ResendEmail from "./components/Auth/ResendEmail";
import Navigation from "./components/Layout/Navbar";
import SittingRequests from "./components/SittingRequests";
import Notifications from "./pages/Notifications";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import { AuthProvider, AuthContext } from "./context/AuthContext";

// Toastify imports
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/resend-email" element={<ResendEmail />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/create-post" element={<CreatePost />} />
      <Route path="/posts/:id" element={<PostDetail />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/sitting-requests" element={<SittingRequests />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <AppRoutes />

        {/* Global Toast Container */}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Router>
    </AuthProvider>
  );
};

export default App;
