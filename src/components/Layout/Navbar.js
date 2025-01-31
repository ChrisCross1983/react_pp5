import React, { useEffect, useState, useCallback } from "react";
import { Navbar, Nav, Button, Container, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { axiosReq } from "../../api/axios";

const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axiosReq.get("/api/notifications/");
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
    if (token) {
      fetchNotifications();
      axiosReq.get("/api/auth/user/")
        .then(response => setUserId(response.data.id))
        .catch(error => console.error("Error fetching user info:", error));
    }
  }, [fetchNotifications]);

  const handleLogout = async () => {
    try {
      await axiosReq.post("/api/logout/");
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
                <Nav.Link as={Link} to="/notifications">
                  🔔 Notifications {unreadCount > 0 && <Badge bg="danger">{unreadCount}</Badge>}
                </Nav.Link>

                <Nav.Link as={Link} to="/sitting-requests">
                  Sitting Requests
                </Nav.Link>

                {userId && (
                  <Nav.Link as={Link} to={`/profile/${userId}`}>
                    Profile
                  </Nav.Link>
                )}

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
