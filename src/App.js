import React, { Suspense, lazy, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Layout/Navbar";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

/* ---------- lazy imports ---------- */
const Home                = lazy(() => import("./pages/Home"));
const Posts               = lazy(() => import("./pages/Posts"));
const CreatePost          = lazy(() => import("./pages/CreatePost"));
const PostDetail          = lazy(() => import("./pages/PostDetail"));
const Profile             = lazy(() => import("./pages/Profile"));
const SittingRequestsPage = lazy(() => import("./pages/SittingRequestsPage"));
const Register            = lazy(() => import("./components/Auth/Register"));
const Login               = lazy(() => import("./components/Auth/Login"));
const ResendEmail         = lazy(() => import("./components/Auth/ResendEmail"));
const ResetPasswordPage   = lazy(() => import("./components/Auth/ResetPasswordPage"));
/* ---------------------------------- */

const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Suspense fallback={<div style={{padding:20, textAlign:"center"}}>Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/resend-email" element={<ResendEmail />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/sitting-requests" element={<SittingRequestsPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
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
