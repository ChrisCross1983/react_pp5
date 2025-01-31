import React, { useEffect, useState } from "react";
import { Button, Card, Tabs, Tab } from "react-bootstrap";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

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
      const receivedRes = await axios.get("/api/posts/requests/incoming/");
      const sentRes = await axios.get("/api/posts/requests/sent/");
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {
      console.error("Error fetching requests", error);
      toast.error("Failed to update request");
    }
    setLoading(false);
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await axios.post(`/api/posts/requests/manage/${requestId}/`, { action });
      fetchRequests();
      toast.success(`Request ${action}ed successfully!`);
    } catch (error) {
      console.error("Error updating request", error);
      toast.error("Failed to update request");
    }
  };

  return (
    <div className="p-4">
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
                        Accept
                      </Button>
                      <Button variant="danger" onClick={() => handleRequestAction(request.id, "decline")}>
                        Decline
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
                  {request.status === "pending" && (
                    <Button variant="warning" onClick={() => handleRequestAction(request.id, "cancel")}>
                      Cancel Request
                    </Button>
                  )}
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
