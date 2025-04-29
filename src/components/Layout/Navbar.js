import React, { useEffect, useContext, useCallback, useState } from "react";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { axiosReq } from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const Navigation = () => {
  const { isAuthenticated, userId, username, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axiosReq.get("notifications/all/");

      if (response.data && Array.isArray(response.data.results)) {
        setNotifications(response.data.results);
        setUnreadCount(response.data.results.filter((n) => n && !n.is_read).length);
      } else {
        console.error("⚠️ Unexpected response format for notifications:", response.data);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("❌ Error fetching notifications:", error.response?.data || error.message);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("username");
    navigate("/login");
  };

  useEffect(() => {
    console.log("🔄 Checking authentication status...");

    if (isAuthenticated) {
      console.log("✅ User is authenticated, fetching user data...");

      axiosReq.get("profiles/auth/user/")
        .then(response => {
          console.log("✅ User Data Loaded:", response.data);

          if (response.data.username) {
            localStorage.setItem("username", response.data.username.toLowerCase());
          }

          fetchNotifications();
        })
        .catch(error => {
          console.error("❌ Error fetching user info:", error.response?.data || error.message);
        });
    }
  }, [isAuthenticated, fetchNotifications]);

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
                {userId && (
                  <Nav.Link as={Link} to={`/profile/${userId}`}>My Hub</Nav.Link>
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