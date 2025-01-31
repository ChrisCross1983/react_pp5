import React from "react";
import { useEffect, useState } from "react";
import { Button, Card, Tabs, Tab } from "react-bootstrap";
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
      const receivedRes = await axiosReq.get("/posts/requests/incoming/");
      const sentRes = await axiosReq.get("/posts/requests/sent/");
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {
      console.error("Error fetching requests", error);
    }
    setLoading(false);
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await axiosReq.post(`/posts/requests/manage/${requestId}/`, { action });
      fetchRequests();
    } catch (error) {
      console.error("Error updating request", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Sitting Requests</h2>
      <Tabs defaultActiveKey="received" id="sitting-requests-tabs">
        <Tab eventKey="received" title="Received Requests">
          {loading ? (
            <p>Loading...</p>
          ) : receivedRequests.length > 0 ? (
            receivedRequests.map((request) => (
              <Card key={request.id} className="mb-4">
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <div>
                    <p><strong>From:</strong> {request.sender.username}</p>
                    <p><strong>Message:</strong> {request.message}</p>
                    <p><strong>Status:</strong> {request.status}</p>
                  </div>
                  {request.status === "pending" && (
                    <div className="space-x-2">
                      <Button onClick={() => handleRequestAction(request.id, "accept")}>
                        ✅ Accept
                      </Button>
                      <Button variant="danger" onClick={() => handleRequestAction(request.id, "decline")}>
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

        <Tab eventKey="sent" title="Sent Requests">
          {loading ? (
            <p>Loading...</p>
          ) : sentRequests.length > 0 ? (
            sentRequests.map((request) => (
              <Card key={request.id} className="mb-4">
                <Card.Body>
                  <p><strong>To:</strong> {request.receiver.username}</p>
                  <p><strong>Message:</strong> {request.message}</p>
                  <p><strong>Status:</strong> {request.status}</p>
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