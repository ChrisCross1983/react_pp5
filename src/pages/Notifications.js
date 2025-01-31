import React, { useState, useEffect } from "react";
import { Button, Spinner, Alert, Container, ListGroup } from "react-bootstrap";
import { axiosReq } from "../api/axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosReq.get("/api/notifications/");
      setNotifications(response.data);
    } catch (err) {
      setError("Error loading notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosReq.post(`/api/notifications/${id}/mark-read/`);
      setNotifications((prev) => prev.map((n) => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosReq.post("/api/notifications/mark-all-read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Notifications</h2>

      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      <Button variant="success" className="mb-3" onClick={markAllAsRead}>
        Mark all as read
      </Button>

      <ListGroup>
        {notifications.length === 0 ? (
          <Alert variant="info">No notifications yet.</Alert>
        ) : (
          notifications.map((notification) => (
            <ListGroup.Item 
              key={notification.id} 
              className={`d-flex justify-content-between ${notification.is_read ? "text-muted" : ""}`}
            >
              {notification.message}
              {!notification.is_read && (
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => markAsRead(notification.id)}
                >
                  Mark as Read
                </Button>
              )}
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Container>
  );
};

export default Notifications;
