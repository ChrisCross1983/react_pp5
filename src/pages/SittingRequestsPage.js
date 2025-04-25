import React, { useEffect, useState, useContext } from "react";
import { Row, Col, Card, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { axiosReq } from "../api/axios";
import { useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const SittingRequestsPage = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const focusRequestId = params.get("focus");
  const [searchParams] = useSearchParams();
  const [responseMessage, setResponseMessage] = useState("");
  const [responseHistory, setResponseHistory] = useState([]);
  const [showSendButton, setShowSendButton] = useState(false);
  const { user } = useContext(AuthContext);


  const focusId = searchParams.get("focus");
  const allRequestsSorted = [...receivedRequests, ...sentRequests].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const loadRequests = async () => {
    try {
      const sentRes = await axiosReq.get("/posts/requests/sent/");
      const receivedRes = await axiosReq.get("/posts/requests/incoming/");

      const sent = sentRes.data.results || sentRes.data;
      const received = receivedRes.data.results || receivedRes.data;

      setSentRequests(sent);
      setReceivedRequests(received);

    } catch (err) {
      console.error("❌ Failed to load sitting requests:", err);
      setError("Failed to load sitting requests.");
    } finally {
      setLoading(false);
    }
  };


  const fetchMessages = async () => {
    try {
      if (!selectedRequest) return;

      const res = await axiosReq.get("/posts/sitting-messages/");
      const related = res.data.results.filter(
        (msg) => msg.sitting_request === selectedRequest.id
      );
      setResponseHistory(related);
    } catch (err) {
      console.error("❌ Failed to load messages", err);
    }
  };


  useEffect(() => {
    if (selectedRequest) {
      fetchMessages();
    }
  }, [selectedRequest]);


  useEffect(() => {
    loadRequests();
  }, []);


  useEffect(() => {
    if (!focusId || sentRequests.length === 0 && receivedRequests.length === 0) return;

    console.log("🧪 Checking focusId:", focusId);
    console.log("📦 sentRequests:", sentRequests);
    console.log("📦 receivedRequests:", receivedRequests);
  
    const all = [...sentRequests, ...receivedRequests];
    console.log("📋 Combined requests:", all);

    const match = all.find((r) => String(r.id) === String(focusId));
    console.log("🔍 Matching request:", match);

    if (match) {
      console.log("🎯 Selecting focused request via effect:", match);
      setSelectedRequest(match);
    } else {
      toast.error("🚫 This sitting request no longer exists.");
    }
  }, [focusId, sentRequests, receivedRequests]);


  const handleRequestAction = async (requestId, action) => {
    try {
      await axiosReq.post(`/posts/requests/manage/${requestId}/`, {
        action: action,
      });
  
      if (responseMessage.trim()) {
        await axiosReq.post("/posts/sitting-messages/", {
          sitting_request: requestId,
          content: responseMessage,
        });
      }

      const previousId = selectedRequest?.id;

      await loadRequests();

      const updatedAll = [...sentRequests, ...receivedRequests];
      const updated = updatedAll.find((r) => r.id === previousId);
      if (updated) {
        setSelectedRequest(updated);
      } else {
        setSelectedRequest(null);
      }
  
      toast.success(`✅ Request ${action === "accept" ? "accepted" : "declined"} successfully!`);
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
    }
  };


  const handleSendMessage = async () => {
    try {
      if (!responseMessage.trim()) return;
  
      await axiosReq.post("/posts/sitting-messages/", {
        sitting_request: selectedRequest.id,
        content: responseMessage,
      });
  
      await fetchMessages();
      setResponseMessage("");
      toast.success("💬 Message sent");
    } catch (err) {
      console.error("❌ Failed to send message", err);
      toast.error("Failed to send message");
    }
  };


  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("❓ Are you sure you want to cancel this request?")) return;

    try {
      await axiosReq.delete(`posts/requests/${requestId}/`);
      await loadRequests();
      setSelectedRequest(null);
      toast.success("🗑️ Request cancelled.");
    } catch (err) {
      console.error("Failed to cancel request", err);
      toast.error("❌ Failed to cancel request.");
    }
  };


  const renderRequestCard = (req, type) => {
    const isSent = type === "sent";
    const cardStyle = {
      backgroundColor: isSent ? "#f0f4ff" : "#fffaf0",
      borderLeft: `4px solid ${isSent ? "#0d6efd" : "#f39c12"}`, // blau vs. orange
    };
  
    return (
      <Card
        key={req.id}
        className={`mb-2 shadow-sm pointer ${selectedRequest?.id === req.id ? "border-primary" : ""}`}
        onClick={() => setSelectedRequest(req)}
        style={cardStyle}
      >
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="me-2">
                {isSent ? "📤 Sent to" : "📥 From"}:
              </span>
              <strong>{isSent ? req.receiver_username : req.sender_username}</strong>
              <br />
              <small className="text-muted">📅 {new Date(req.created_at).toLocaleDateString()}</small><br />
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
  };


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
            {allRequestsSorted.map((req) =>
              renderRequestCard(req, receivedRequests.find(r => r.id === req.id) ? "received" : "sent")
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

                  {/* Response input for accepted or pending */}
                  {["pending", "accepted"].includes(selectedRequest.status) && (
                    <div className="message-input-wrapper mt-3">
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Write a message..."
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        onFocus={() => setShowSendButton(true)}
                        onBlur={() => setTimeout(() => setShowSendButton(false), 200)}
                      />
                      {showSendButton && responseMessage.trim() && (
                        <Button
                          type="button"
                          onClick={handleSendMessage}
                          className="comment-submit-btn"
                        >
                          ➤
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  {selectedRequest.status === "pending" && (
                    <div className="mt-3 d-flex gap-2">
                      {receivedRequests.find((r) => r.id === selectedRequest.id) ? (
                        <>
                          <Button variant="success" onClick={() => handleRequestAction(selectedRequest.id, "accept")}>
                            ✅ Accept
                          </Button>
                          <Button variant="danger" onClick={() => handleRequestAction(selectedRequest.id, "decline")}>
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

                  {/* Message history */}
                  {responseHistory.length > 0 && (
                    <div className="mt-4">
                      <h6>💬 Messages</h6>
                      <div className="message-history">
                        {responseHistory
                          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) 
                          .map((msg) => {
                            const isSelf = msg.sender_name === user?.username;
                            return (
                              <div
                                key={msg.id}
                                className={`chat-bubble ${
                                  msg.sender_name === user?.username ? "chat-self" : "chat-other"
                                }`}
                              >
                                <p className="mb-1">{msg.content}</p>
                                <small className="text-muted">
                                  {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString()}
                                </small>
                              </div>
                            );
                          })
                        }
                      </div>
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
