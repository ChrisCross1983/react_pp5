import React, { createContext, useState, useEffect } from "react";
import { axiosReq } from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      axiosReq.get("profiles/auth/user/")
        .then(response => {
          setUserId(response.data.pk);
          setUsername(response.data.username);
        })
        .catch(error => {
          console.error("❌ Error fetching user info:", error.response?.data || error.message, "🔎 Check if the URL is correct.");
          setUserId(null);
          setUsername("");
        });
    }
  }, [isAuthenticated]);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token found.");
      
      await axiosReq.post("auth/logout/", { refresh: refreshToken });

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      setIsAuthenticated(false);
      setUserId(null);
      setUsername("");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
