import React, { useEffect, useState } from "react";
import { Navbar, Nav, Button, Container, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { axiosReq } from "../../api/axios";

const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axiosReq.get("/notifications/");
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [setNotifications, setUnreadCount]);
  
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
    if (token) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const handleLogout = async () => {
    try {
      await axiosReq.post("/logout/");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsAuthenticated(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Lucky Cat
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                {/* Bell appears, only if unread messages > 0 */}
                {unreadCount > 0 && (
                  <Nav.Link as={Link} to="/notifications" className="position-relative">
                    🔔 Notifications
                    <Badge bg="danger" className="ms-1">
                      {unreadCount}
                    </Badge>
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/profile">
                  Profile
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
