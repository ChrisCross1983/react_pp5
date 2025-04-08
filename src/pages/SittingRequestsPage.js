// src/pages/SittingRequestsPage.js
import React, { useEffect, useState } from "react";
import { Card, Button, Modal, Spinner, Alert, Tabs, Tab } from "react-bootstrap";
import { axiosReq } from "../api/axios";

const SittingRequestsPage = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const sentRes = await axiosReq.get("/posts/requests/sent/");
      const receivedRes = await axiosReq.get("/posts/requests/incoming/");

      setSentRequests(Array.isArray(sentRes.data) ? sentRes.data : sentRes.data.results || []);
      setIncomingRequests(Array.isArray(receivedRes.data) ? receivedRes.data : receivedRes.data.results || []);
    } catch (err) {
      console.error("Error loading sitting requests", err);
      setError("Failed to load sitting requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestAction = async (requestId, action) => {
    try {
      await axiosReq.post(`posts/requests/manage/${requestId}/`, { status: action });
      fetchRequests();
      setShowModal(false);
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await axiosReq.delete(`posts/requests/${requestId}/`);
      fetchRequests();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to cancel request", err);
    }
  };

  if (loading) return <Spinner animation="border" className="mt-4" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🪑 Sitting Requests</h2>
      <Tabs defaultActiveKey="received" className="mb-4">
        <Tab eventKey="received" title="📥 Received">
          {incomingRequests.length === 0 ? (
            <Alert variant="info" className="mt-3">No received requests.</Alert>
          ) : (
            incomingRequests.map((req) => (
              <Card key={req.id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>From: {req.sender_username}</Card.Title>
                  <Card.Text>Status: {req.status}</Card.Text>
                  <Button variant="primary" onClick={() => { setSelectedRequest(req); setShowModal(true); }}>
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            ))
          )}
        </Tab>

        <Tab eventKey="sent" title="📤 Sent">
          {sentRequests.length === 0 ? (
            <Alert variant="info" className="mt-3">No sent requests.</Alert>
          ) : (
            sentRequests.map((req) => (
              <Card key={req.id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>To: {req.receiver_username}</Card.Title>
                  <Card.Text>Status: {req.status}</Card.Text>
                  <Button variant="primary" onClick={() => { setSelectedRequest(req); setShowModal(true); }}>
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            ))
          )}
        </Tab>
      </Tabs>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <p><strong>From:</strong> {selectedRequest.sender_username}</p>
              <p><strong>To:</strong> {selectedRequest.receiver_username}</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
              <p><strong>Message:</strong> {selectedRequest.message}</p>
              <p><strong>Created:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
              {selectedRequest.status === "pending" && (
                <div className="mt-3 d-flex gap-2">
                  {incomingRequests.find((r) => r.id === selectedRequest.id) ? (
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
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SittingRequestsPage;
