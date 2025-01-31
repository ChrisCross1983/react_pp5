import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Container } from "react-bootstrap";
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
      const response = await axiosReq.get("/notifications/");
      setNotifications(response.data);
    } catch (err) {
      setError("Error loading notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosReq.post("/notifications/mark-all-read/");
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

      {notifications.length === 0 ? (
        <Alert variant="info">No notifications yet.</Alert>
      ) : (
        notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`mb-3 shadow-sm ${notification.is_read ? "text-muted" : ""}`}
          >
            <Card.Body>
              <Card.Text>{notification.message}</Card.Text>
              <small className="text-muted">{new Date(notification.created_at).toLocaleString()}</small>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Notifications;
