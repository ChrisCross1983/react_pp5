import React, { useEffect, useState } from "react";
import { Button, Badge, Card, Tabs, Tab } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { axiosReq } from "../api/axios";

export default function SittingRequests() {
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
      toast.error("Failed to update requests");
    }
    setLoading(false);
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await axiosReq.post(`posts/requests/manage/${requestId}/`, { status: action });

      fetchRequests();
      toast.success(`Request ${action}ed successfully!`);
    } catch (error) {
      console.error("Error updating request", error);
      toast.error("Failed to update request");
    }
  };

  const createSittingRequest = async (postId) => {
    try {
      const response = await axiosReq.post(`posts/${postId}/request/`, {
        message: "I would like to request this sitting.",
      });

      toast.success("Sitting request sent successfully!");
      fetchRequests();
    } catch (error) {
      console.error("Error creating sitting request:", error);
      toast.error("Failed to create sitting request.");
    }
  };

  return (
    <div className="p-4">
      <Tabs
        defaultActiveKey="received"
        id="sitting-requests-tabs"
        variant="pills"
        className="mb-3 justify-content-left"
      >
        <Tab eventKey="received" title="📥 Received">
          {receivedRequests.length > 0 ? (
            receivedRequests.map((request) => (
              <Card key={request.id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>
                    From: <strong>{request.sender_username}</strong>
                  </Card.Title>
                  <Card.Text>{request.message}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
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
                    {request.status === "pending" && (
                      <div className="d-flex gap-2">
                        <Button size="sm" onClick={() => handleRequestAction(request.id, "accepted")}>✅ Accept</Button>
                        <Button size="sm" variant="danger" onClick={() => handleRequestAction(request.id, "declined")}>❌ Decline</Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No received requests.</p>
          )}
        </Tab>

        <Tab eventKey="sent" title="📤 Sent">
          {sentRequests.length > 0 ? (
            sentRequests.map((request) => (
              <Card key={request.id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>
                    To: <strong>{request.receiver_username}</strong>
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

      <Button variant="success" className="mt-3" onClick={() => createSittingRequest(1)}>
        🐱 Request Sitting
      </Button>
    </div>
  );
}
