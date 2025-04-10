import React, { useState, useEffect } from "react";
import { Button, Spinner, Alert, Container, ListGroup } from "react-bootstrap";
import { axiosReq } from "../api/axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const error = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosReq.get("notifications/all/");

      if (response.data && Array.isArray(response.data.results)) {
        setNotifications(response.data.results);
      } else {
        console.error("⚠️ Unexpected response format:", response.data);
        setNotifications([]);
      }
    } catch (err) {
      console.error("❌ Error loading notifications:", err.response?.data || err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };  

  const markAsRead = async (id) => {
    try {
      await axiosReq.post(`notifications/${id}/mark-read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("❌ Error marking notification as read:", error.response?.data || error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosReq.post("notifications/mark-all-read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("❌ Error marking all notifications as read:", err.response?.data || err.message);
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
          notifications.map((notification) =>
            notification && typeof notification === "object" ? (
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
            ) : (
              <Alert variant="warning" key={`error-${Math.random()}`}>
                ⚠️ Invalid notification format
              </Alert>
            )
          )
        )}
      </ListGroup>
    </Container>
  );
};

export default Notifications;
