import React, { useEffect, useContext, useCallback, useState } from "react";
import { Navbar, Nav, Button, Container, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { axiosReq } from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const Navigation = () => {
  const { isAuthenticated, setIsAuthenticated, userId, setUserId, username, setUsername } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axiosReq.get("notifications/");
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    console.log("🔄 Checking authentication status...");

    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);

    if (token) {
      console.log("✅ User is authenticated, fetching user data...");
      
      axiosReq.get("auth/user/")
        .then(response => {
          console.log("✅ User Data Loaded:", response.data);
          setUserId(response.data.pk);
          setUsername(response.data.username);
          fetchNotifications();
        })
        .catch(error => {
          console.error("❌ Error fetching user info:", error.response?.data || error.message);
          setUserId(null);
          setUsername("");
        });
    } else {
      console.log("❌ No access token found, user is not authenticated.");
      setUserId(null);
      setUsername("");
    }
  }, [isAuthenticated, fetchNotifications]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token found.");

      await axiosReq.post("auth/logout/", { refresh: refreshToken });

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setIsAuthenticated(false);
      setUserId(null);
      setUsername("");

      navigate("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error.response?.data || error.message);
    }
  };

  console.log("🔍 Authenticated:", isAuthenticated, "| User ID:", userId);

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Lucky Cat</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/sitting-requests">Sitting Requests</Nav.Link>
                <Nav.Link as={Link} to="/notifications">
                  🔔 Notifications{" "}
                  {unreadCount > 0 && <Badge bg="danger">{unreadCount}</Badge>}
                </Nav.Link>
                {userId && (
                  <Nav.Link as={Link} to={`/profile/${userId}`}>Profile</Nav.Link>
                )}
                <span className="navbar-text mx-2 text-light">
                  Logged in as {username || "Unknown"}
                </span>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
