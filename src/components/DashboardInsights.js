import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup";
import { axiosReq } from "../api/axios";
import classNames from "classnames";

export default function DashboardInsights() {
  const [activities, setActivities] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [activityRes, kpiRes] = await Promise.all([
          axiosReq.get("/notifications/all/"),
          axiosReq.get("/profiles/kpis/")
        ]);
        setActivities(activityRes.data?.results || []);
        setKpis(kpiRes.data);
        console.log("📊 KPI data:", kpiRes.data);
        console.log("📦 Final Activities:", activityRes.data.results);
      } catch (err) {
        console.error("❌ Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleClick = async (n) => {
    try {
      await axiosReq.post(`/notifications/${n.id}/mark-read/`);
      if (n.type === "request") {
        navigate(`/sitting-requests?focus=${n.sitting_request_id}`);
      } else if (["comment", "like"].includes(n.type) && n.post_id) {
        navigate(`/posts/${n.post_id}`);
      } else if (n.type === "follow" && n.sender_profile_id) {
        navigate(`/profiles/${n.sender_profile_id}`);
      }

      setActivities((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      );
    } catch (err) {
      console.error("❌ Error handling activity click", err);
    }
  };

  return (
    <Card className="mb-4 shadow-sm sidebar-card">
      <Card.Header className="bg-light fw-bold">📌 Dashboard & Activity</Card.Header>
      <Card.Body>
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            {kpis && (
              <div className="mb-3 small">
                <div><strong>Posts:</strong> {kpis.total_posts}</div>
                <div><strong>Comments:</strong> {kpis.total_comments}</div>
                <div><strong>Likes:</strong> {kpis.total_likes}</div>
                <div><strong>Followers:</strong> {kpis.total_followers}</div>
                <div><strong>Following:</strong> {kpis.total_following}</div>
                <div><strong>Requests:</strong> Sent {kpis.sent_requests} / Received {kpis.received_requests}</div>
              </div>
            )}
            {activities.length === 0 ? (
              <p className="text-muted small">No recent activity.</p>
            ) : (
              <div className="notifications-scroll-container">
                <ListGroup variant="flush">
                  {activities.map((n) => (
                    <ListGroup.Item
                      key={n.id}
                      className={classNames("small", "pointer", {
                        "bg-light": !n.is_read,
                      })}
                      onClick={() => handleClick(n)}
                    >
                      <div><strong>{n.type.toUpperCase()}</strong>: {n.message}</div>
                      <div className="text-muted small">{new Date(n.created_at).toLocaleString()}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}
