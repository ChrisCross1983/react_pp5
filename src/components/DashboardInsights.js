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
      await axiosReq.post(`/notifications/${n.id}/mark-read/`);
      console.log("📨 Marked as read:", n.id);
  
      switch (n.type) {
        case "comment":
          if (n.post_id) {
            const commentParam = n.comment_id ? `&comment=${n.comment_id}` : "";
            navigate(`/posts/${n.post_id}?from=notification${commentParam}`);
          } else {
            toast.warn("❌ No post ID found for comment.");
          }
          break;
  
        case "like":
          if (n.post_id) {
            const commentParam = n.comment_id ? `&comment=${n.comment_id}` : "";
            const likeParam = n.comment_id ? "" : "&like=true";
            try {
              await axiosReq.get(`/posts/${n.post_id}/`);
              navigate(`/posts/${n.post_id}?from=notification${commentParam}${likeParam}`);
            } catch {
              toast.error("⚠️ This post no longer exists.");
            }
          }
          break;
  
        case "follow":
          if (userId) {
            navigate(`/profile/${userId}?tab=follow-requests`);
          } else {
            toast.error("⚠️ Cannot identify current user.");
          }
          break;
  
        case "request":
          if (n.sitting_request_id) {
            navigate(`/sitting-requests?focus=${n.sitting_request_id}`);
          } else {
            toast.warn("❌ No request ID found.");
          }
          break;
  
        case "sitting_message":
          if (n.sitting_request_id && n.sitting_message_id) {
            navigate(`/sitting-requests?focus=${n.sitting_request_id}&message=${n.sitting_message_id}`);
          } else if (n.sitting_request_id) {
            navigate(`/sitting-requests?focus=${n.sitting_request_id}`);
          } else {
            toast.warn("❌ No sitting message details found.");
          }
          break;
  
        default:
          toast.info("🔕 Unknown notification type.");
          console.warn("📎 Unknown notification type:", n.type);
      }
  
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


  const handleMarkAllAsRead = async () => {
    try {
      await axiosReq.post("/notifications/mark-all-read/");
      setActivities(prev => prev.map(a => ({ ...a, is_read: true })));
      toast.success("✅ All notifications marked as read.");
    } catch (err) {
      console.error("❌ Failed to mark all notifications as read", err);
      toast.error("❌ Could not mark all as read.");
    }
  };


  return (
    <Card className="mb-4 shadow-sm sidebar-card">
      <Card.Header className="bg-light fw-bold d-flex justify-content-between align-items-center dashboard-insights-header">
        <div className="d-flex align-items-center">
          <span className="me-2">Notifications</span>
          {unreadCount > 0 && (
            <span className="badge bg-danger rounded-pill me-2">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-outline-success btn-sm"
            onClick={handleMarkAllAsRead}
            title="Mark all as read"
          >
            ✅
          </button>
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
                  <div>
                    {n.type === "sitting_message" ? (
                      <>
                        <strong>💬 Chat:</strong> {n.message}
                      </>
                    ) : (
                      <>
                        <strong>{n.type.toUpperCase()}</strong>: {n.message}
                      </>
                    )}
                  </div>
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
