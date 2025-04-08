import React from "react";
import { useEffect, useState } from "react";
import { Button, Card, Tabs, Tab, Badge } from "react-bootstrap";
import { axiosReq } from "../api/axios";

export default function TopFollowedUsers() {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const receivedRes = await axiosReq.get("posts/requests/incoming/");
      const sentRes = await axiosReq.get("posts/requests/sent/");
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {
      console.error("Error fetching requests", error);
    }
    setLoading(false);
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await axiosReq.post(`posts/requests/manage/${requestId}/`, { action });
      fetchRequests();
    } catch (error) {
      console.error("Error updating request", error);
    }
  };

  return (
    <div className="p-3">
      <Tabs
        defaultActiveKey="received"
        id="top-followed-tabs"
        variant="pills"
        className="mb-3 justify-content-left"
      >
        <Tab eventKey="received" title="📥 Received">
          {loading ? (
            <p>Loading...</p>
          ) : receivedRequests.length > 0 ? (
            receivedRequests.map((request) => (
              <Card key={request.id} className="mb-3 shadow-sm">
                <Card.Body className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Title>
                      From: <strong>{request.sender?.username}</strong>
                    </Card.Title>
                    <Card.Text>{request.message}</Card.Text>
                    <Badge
                      bg={
                        request.status === "pending"
                          ? "warning"
                          : request.status === "accepted"
                          ? "success"
                          : "danger"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                  {request.status === "pending" && (
                    <div className="d-flex flex-column gap-2 align-items-end">
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(request.id, "accept")}
                      >
                        ✅ Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRequestAction(request.id, "decline")}
                      >
                        ❌ Decline
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No received requests.</p>
          )}
        </Tab>

        <Tab eventKey="sent" title="📤 Sent">
          {loading ? (
            <p>Loading...</p>
          ) : sentRequests.length > 0 ? (
            sentRequests.map((request) => (
              <Card key={request.id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>
                    To: <strong>{request.receiver?.username}</strong>
                  </Card.Title>
                  <Card.Text>{request.message}</Card.Text>
                  <Badge
                    bg={
                      request.status === "pending"
                        ? "warning"
                        : request.status === "accepted"
                        ? "success"
                        : "danger"
                    }
                  >
                    {request.status}
                  </Badge>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No sent requests.</p>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}