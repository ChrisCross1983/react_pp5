import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup";
import { axiosReq } from "../api/axios";
import classNames from "classnames";

export default function DashboardInsights() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchActivityFeed = async () => {
      try {
        const response = await axiosReq.get("/notifications/all/");
        console.log("🧪 Raw API Response:", response.data);
  
        const activityList = response.data?.results || [];
        console.log("📦 Final Activities:", activityList);
  
        setActivities(activityList);
      } catch (err) {
        console.error("❌ Error loading activity feed", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchActivityFeed();
  }, []);


  const handleClick = async (n) => {
    console.log("🔍 Comment Notification clicked", n);
    console.log("🔗 post_id:", n.post_id);

    try {
      await axiosReq.post(`/notifications/${n.id}/mark-read/`);
      console.log("🖱️ Clicked Notification:", n);

      switch (n.type) {
        case "request":
          navigate(`/sitting-requests?focus=${n.sitting_request_id}`);
          break;
        case "comment":
        case "like":
          if (n.post_id) {
            navigate(`/posts/${n.post_id}`);
          }
          break;
        case "follow":
          if (n.sender_profile_id) {
            navigate(`/profiles/${n.sender_profile_id}`);
          }
          break;
        default:
          break;
      }

      setActivities((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, is_read: true } : item
        )
      );
    } catch (err) {
      console.error("Error handling activity click", err);
    }
  };


  return (
    <Card className="mb-4 shadow-sm sidebar-card">
      <Card.Header className="bg-light fw-bold">📌 Dashboard & Activity</Card.Header>
      <Card.Body>
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : activities.length === 0 ? (
          <p className="text-muted small">No recent activity.</p>
        ) : (
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
        )}
      </Card.Body>
    </Card>
  );
}
