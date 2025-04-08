// src/components/DashboardInsights.js

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import { axiosReq } from "../api/axios";

export default function DashboardInsights() {
  const [notifications, setNotifications] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await axiosReq.get("/notifications/overview/");
        setNotifications(res.data.notifications ?? []);
        setRecentComments(res.data.comments ?? []);
      } catch (err) {
        console.error("Error loading dashboard overview", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <Card className="mb-4 shadow-sm sidebar-card">
      <Card.Header className="bg-light fw-bold">📊 Dashboard Insights</Card.Header>
      <Card.Body>
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            {/* 📬 Notifications */}
            <h6 className="fw-semibold mb-2">📬 Unread Notifications</h6>
            <ListGroup variant="flush" className="mb-3">
              {notifications.length === 0 ? (
                <div className="text-muted small">No new notifications</div>
              ) : (
                notifications.map((n) => (
                  <ListGroup.Item key={n.id} className="small">
                    {n.message}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>

            {/* 💬 Comments */}
            <h6 className="fw-semibold mb-2">💬 Comments on your Posts</h6>
            <ListGroup variant="flush">
              {recentComments.length === 0 ? (
                <div className="text-muted small">No recent comments</div>
              ) : (
                recentComments.map((c) => (
                  <ListGroup.Item key={c.id} className="small">
                    <strong>{c.content.slice(0, 60)}</strong>
                    <div className="text-muted small">Post: {c.post_title}</div>
                    <Link to={`/posts/${c.post_id}`} className="btn btn-link btn-sm px-0">
                      ↪ Reply
                    </Link>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
