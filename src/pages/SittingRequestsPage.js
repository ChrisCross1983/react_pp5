import React, { useEffect, useState } from "react";
import { Row, Col, Card, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { axiosReq } from "../api/axios";
import { useLocation } from "react-router-dom";

const SittingRequestsPage = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const focusRequestId = params.get("focus");

  const fetchRequests = async () => {
    try {
      const sentRes = await axiosReq.get("/posts/requests/sent/");
      const receivedRes = await axiosReq.get("/posts/requests/incoming/");
      setSentRequests(sentRes.data.results || sentRes.data);
      setReceivedRequests(receivedRes.data.results || receivedRes.data);
    } catch (err) {
      setError("Failed to load sitting requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const all = [...sentRequests, ...receivedRequests];
    const match = all.find((r) => r.id.toString() === focusRequestId);
    if (match) setSelectedRequest(match);
  }, [focusRequestId, sentRequests, receivedRequests]);

  const handleRequestAction = async (requestId, action) => {
    try {
      await axiosReq.post(`/posts/requests/manage/${requestId}/`, { status: action });
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await axiosReq.delete(`posts/requests/${requestId}/`);
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error("Failed to cancel request", err);
    }
  };

  const renderRequestCard = (req, type) => (
    <Card
      key={req.id}
      className={`mb-2 shadow-sm pointer ${selectedRequest?.id === req.id ? "border-primary" : ""}`}
      onClick={() => setSelectedRequest(req)}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="me-2">{type === "sent" ? "📤 Sent to" : "📥 From"}:</span>
            <strong>{type === "sent" ? req.receiver_username : req.sender_username}</strong>
            <br />
            <small className="text-muted">Post: {req.post_title}</small>
            <Badge bg="secondary" className="ms-2">{req.post_category}</Badge>
          </div>
          <Badge bg={req.status === "pending" ? "warning" : req.status === "accepted" ? "success" : "danger"}>
            {req.status}
          </Badge>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🪑 Sitting Requests</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Row>
          {/* Left Column - Combined List */}
          <Col md={5}>
            <h5 className="mb-3">📋 All Requests</h5>
            {[...receivedRequests, ...sentRequests].map((req) =>
              renderRequestCard(req, receivedRequests.includes(req) ? "received" : "sent")
            )}
          </Col>

          {/* Right Column - Detail View */}
          <Col md={7}>
            {selectedRequest ? (
              <Card className="shadow-sm">
                <Card.Header className="fw-bold">Request Details</Card.Header>
                <Card.Body>
                  <p><strong>From:</strong> {selectedRequest.sender_username}</p>
                  <p><strong>To:</strong> {selectedRequest.receiver_username}</p>
                  <p><strong>Post:</strong> {selectedRequest.post_title} <Badge bg="info">{selectedRequest.post_category}</Badge></p>
                  <p><strong>Status:</strong> {selectedRequest.status}</p>
                  <p><strong>Message:</strong> {selectedRequest.message}</p>
                  <p><strong>Created:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                  {selectedRequest.status === "pending" && (
                    <div className="mt-3 d-flex gap-2">
                      {receivedRequests.find((r) => r.id === selectedRequest.id) ? (
                        <>
                          <Button variant="success" onClick={() => handleRequestAction(selectedRequest.id, "accepted")}>
                            ✅ Accept
                          </Button>
                          <Button variant="danger" onClick={() => handleRequestAction(selectedRequest.id, "declined")}>
                            ❌ Decline
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline-danger" onClick={() => handleCancelRequest(selectedRequest.id)}>
                          ❌ Cancel Request
                        </Button>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            ) : (
              <Alert variant="info">Select a request to view details</Alert>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default SittingRequestsPage;
