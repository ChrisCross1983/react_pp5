import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import ListGroup from "react-bootstrap/ListGroup";
import { axiosReq } from "../api/axios";
import classNames from "classnames";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function DashboardInsights() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const unreadCount = activities.filter((a) => !a.is_read).length;

  useEffect(() => {
    const fetchActivityFeed = async () => {
      try {
        const response = await axiosReq.get("/notifications/all/");
        const activityList = response.data?.results || [];
        setActivities(activityList);
      } catch (err) {
        console.error("❌ Error loading notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityFeed();
  }, []);


  const handleClick = async (n) => {
    console.log("🔍 Notification clicked:", n);

    try {
      // Mark as read
      await axiosReq.post(`/notifications/${n.id}/mark-read/`);
      console.log("📨 Marked as read:", n.id);
  
      switch (n.type) {
        case "comment":
        case "like":
          if (n.post_id) {
            console.log("💬 comment_id in notification:", n.comment_id);
            const commentParam = n.comment_id ? `&comment=${n.comment_id}` : "";
            try {
              await axiosReq.get(`/posts/${n.post_id}/`);
              navigate(`/posts/${n.post_id}?from=notification${commentParam}`);
            } catch {
              toast.error("⚠️ This post no longer exists.");
              console.warn("❌ Tried to access deleted post:", n.post_id);
            }
          } else {
            toast.warn("❌ No post ID found for this notification.");
          }
          break;

        case "follow":
          if (userId) {
            console.log("👥 Navigating to profile with tab=follow-requests:", userId);
            navigate(`/profile/${userId}?tab=follow-requests`);
          } else {
            toast.error("⚠️ Cannot identify current user.");
          }
          break;

        case "request":
          if (n.sitting_request_id) {
            console.log("🪑 Navigating to sitting request:", n.sitting_request_id);
            navigate(`/sitting-requests?focus=${n.sitting_request_id}`);
          } else {
            toast.warn("❌ No request ID found.");
          }
          break;

        default:
          toast.info("🔕 Unknown notification type.");
          console.warn("📎 Unknown type:", n.type);
      }

      // Update state
      setActivities((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, is_read: true } : item
        )
      );
    } catch (err) {
      console.error("❌ Error handling notification click:", err);
      toast.error("⚠️ Failed to open notification.");
    }
  };


  return (
    <Card className="mb-4 shadow-sm sidebar-card">
      <Card.Header className="bg-light fw-bold d-flex justify-content-between align-items-center">
        <span>📌 Notifications</span>
        {unreadCount > 0 && (
          <span className="badge bg-danger rounded-pill">
            {unreadCount}
          </span>
        )}
      </Card.Header>

      <Card.Body>
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : activities.length === 0 ? (
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
                  <div className="text-muted small">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
