import React, { useEffect, useState, useContext, useRef } from "react";
import { Row, Col, Card, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { axiosReq } from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { Dropdown as BsDropdown } from "react-bootstrap";
import { Modal } from "react-bootstrap";


const SittingRequestsPage = ({ onClose }) => {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseHistory, setResponseHistory] = useState([]);
  const [showSendButton, setShowSendButton] = useState(false);
  const { userId } = useContext(AuthContext);
  const [highlightRequestId, setHighlightRequestId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState("");
  const [showDropdownId, setShowDropdownId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const searchParams = new URLSearchParams(useLocation().search);
  const focusId = searchParams.get("focus");
  const messageId = searchParams.get("message");
  const scrollRef = useRef(null);
  const { search } = useLocation();
  const location = useLocation();


  const navigate = useNavigate();
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
      if (!selectedRequest?.id) return;
  
      const res = await axiosReq.get("/posts/sitting-messages/");
      const related = res.data.results.filter(
        (msg) => msg.sitting_request === selectedRequest.id
      );
      setResponseHistory(related);
  
      if (messageId) {
        const exists = related.find((msg) => String(msg.id) === String(messageId));
        if (!exists) {
          toast.error("🚫 This message no longer exists.");
          setSelectedRequest(null);
        }
      }
  
    } catch (err) {
      toast.error("❌ Failed to load messages");
    }
  };


  const toggleDropdown = (id) => {
    setShowDropdownId(prev => prev === id ? null : id);
  };


  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setShowEditModal(true);
    setShowDropdownId(null);
  };


  const handleSaveEditMessage = async () => {
    try {
      await axiosReq.patch(`/posts/sitting-messages/${editingMessage.id}/`, {
        content: editingMessage.content,
      });
      await fetchMessages();
      toast.success("✏️ Message updated!");
      setShowEditModal(false);
    } catch (err) {
      console.error("❌ Failed to edit message", err);
      toast.error("Failed to edit message.");
    }
  };


  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("❓ Are you sure you want to delete this message?")) return;
    try {
      await axiosReq.delete(`/posts/sitting-messages/${messageId}/`);
      await fetchMessages();
      toast.success("🗑️ Message deleted!");
    } catch (err) {
      console.error("❌ Failed to delete message", err);
      toast.error("Failed to delete message.");
    }
  };


  useEffect(() => {
    if (selectedRequest?.id) {
      fetchMessages();
    }
  }, [selectedRequest?.id]);


  useEffect(() => {
    loadRequests();

    if (selectedRequest?.id) {
      fetchMessages();
    }
    
  }, []);


  useEffect(() => {
    if (!focusId || (sentRequests.length === 0 && receivedRequests.length === 0)) return;
  
    const all = [...sentRequests, ...receivedRequests];
    const matchedRequest = all.find((r) => String(r.id) === String(focusId));
  
    if (matchedRequest) {
      setSelectedRequest(matchedRequest);
    
      if (!messageId) {
        setHighlightRequestId(matchedRequest.id);
    
        setTimeout(() => {
          setHighlightRequestId(null);
        }, 2000);
      }
    }
     else {
      toast.error("🚫 This sitting request no longer exists.");
    }
  }, [focusId, sentRequests, receivedRequests]);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    if (!messageId || responseHistory.length === 0) return;
  
    const tryScroll = () => {
      const target = document.getElementById(`chat-msg-${messageId}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setTimeout(tryScroll, 100);
      }
    };
  
    setTimeout(tryScroll, 100);
  }, [responseHistory, messageId]);


  const handleRequestAction = async (requestId, action) => {
    try {
      await axiosReq.post(`/posts/requests/manage/${requestId}/`, {
        action: action,
      });

      toast.success(`✅ Request ${action === "accept" ? "accepted" : "declined"} successfully!`);
  
      await loadRequests();
  
      const updatedAll = [...receivedRequests, ...sentRequests];
      const updated = updatedAll.find((r) => r.id === requestId);
      if (updated) {
        setSelectedRequest(updated);
      } else {
        setSelectedRequest(null);
      }
  
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
      toast.error(`❌ Failed to ${action} request.`);
    }
  };


  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
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
      borderLeft: `4px solid ${isSent ? "#0d6efd" : "#f39c12"}`,
    };


    return (
      <Card
        id={`request-${req.id}`}
        key={req.id}
        className={`mb-2 shadow-sm pointer 
          ${selectedRequest?.id === req.id ? "border-primary" : ""} 
          ${highlightRequestId === req.id ? "highlight-request" : ""}
        `}
        onClick={() => handleSelectRequest(req)}
        style={cardStyle}
      >
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
            <img
              src={isSent ? req.receiver_profile_picture : req.sender_profile_picture}
              alt="Profile"
              className="sidebar-profile-pic"
            />
              <div>
                <div>
                  <span className="me-2">
                    {isSent ? "📤 Sent to" : "📥 From"}:
                  </span>
                  <strong>{isSent ? req.receiver_username : req.sender_username}</strong>
                </div>
                <div className="small text-muted">
                  📅 {new Date(req.created_at).toLocaleDateString()}
                </div>
                <div className="small text-muted">
                  📄 {req.post_title}
                  <Badge bg="secondary" className="ms-2">{req.post_category}</Badge>
                </div>
              </div>
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
        <>
          <Row>
            <Col xs={12} lg={5}>
              {allRequestsSorted.map((req) =>
                renderRequestCard(req, receivedRequests.find(r => r.id === req.id) ? "received" : "sent")
              )}
            </Col>
  
            {!isMobile && (
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
  
                      {selectedRequest.status === "accepted" && (
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
                      <div className="chatbox-container">
                      {responseHistory
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .map((msg) => {
                          const isSelf = msg?.sender?.id === userId;
                          return (
                            <div
                              key={msg.id}
                              id={`chat-msg-${msg.id}`}
                              className={`chat-message-wrapper ${isSelf ? "self" : "other"} ${
                                String(msg.id) === messageId ? "highlight-comment" : ""
                              }`}
                            >
                              <div className={`chat-bubble ${isSelf ? "chat-self" : "chat-other"}`}>
                                <div className="chat-header">
                                  <div className="chat-author-bar pointer" onClick={() => navigate(`/profile/${msg.sender.id}`)}>
                                    <img
                                      src={
                                        msg.sender?.profile_picture?.includes("cloudinary.com")
                                          ? msg.sender.profile_picture
                                          : `https://res.cloudinary.com/daj7vkzdw/${msg.sender.profile_picture}`
                                      }
                                      alt="Avatar"
                                      className="chat-avatar"
                                    />
                                    <div className="chat-author-info">
                                      <strong>{msg.sender_name}</strong>
                                      <div className="text-muted small">
                                        {new Date(msg.created_at).toLocaleString([], {
                                          dateStyle: 'short',
                                          timeStyle: 'short'
                                        })}
                                      </div>
                                    </div>
                                  </div>
  
                                  {isSelf && (
                                    <BsDropdown className="chat-options">
                                      <BsDropdown.Toggle
                                        as="button"
                                        className="chat-options-btn border-0 bg-transparent"
                                      >
                                        ⋮
                                      </BsDropdown.Toggle>
                                      <BsDropdown.Menu align="end">
                                        <BsDropdown.Item onClick={() => handleEditMessage(msg)}>
                                          ✏️ Edit
                                        </BsDropdown.Item>
                                        <BsDropdown.Item
                                          className="text-danger"
                                          onClick={() => handleDeleteMessage(msg.id)}
                                        >
                                          🗑 Delete
                                        </BsDropdown.Item>
                                      </BsDropdown.Menu>
                                    </BsDropdown>
                                  )}
                                </div>
                                <div className="chat-message-content">
                                  <p>{msg.content}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  <Alert variant="info">
                    {allRequestsSorted.length === 0
                      ? "No sitting requests yet. Your sent and received requests will appear here once available."
                      : "Select a sitting request to view its details."}
                  </Alert>
                )}
              </Col>
            )}
          </Row>
  
          {isMobile && selectedRequest && (
            <Modal
              show={true}
              onHide={() => {
                setSelectedRequest(null);
              }}
              centered
              size="lg"
              scrollable
              backdrop="static"
              keyboard
            >
              <Modal.Header closeButton>
                <Modal.Title>Request Details</Modal.Title>
              </Modal.Header>
              <Modal.Body className="d-flex flex-column" style={{ maxHeight: "80vh" }}>
                <div className="mb-3">
                  <p><strong>From:</strong> {selectedRequest.sender_username}</p>
                  <p><strong>To:</strong> {selectedRequest.receiver_username}</p>
                  <p>
                    <strong>Post:</strong> {selectedRequest.post_title}{" "}
                    <Badge bg="info">{selectedRequest.post_category}</Badge>
                  </p>
                  <p>
                    <strong>Status: </strong>
                    <Badge
                      bg={selectedRequest.status === "pending" ? "warning" : selectedRequest.status === "accepted" ? "success" : "danger"}
                    >
                      {selectedRequest.status}
                    </Badge>
                  </p>
                  <p><strong>Message:</strong> {selectedRequest.message}</p>
                  <p><strong>Created:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>

                {selectedRequest.status === "accepted" && (
                  <>
                    <div
                      className="message-history flex-grow-1 mb-3"
                      style={{ overflowY: "auto", maxHeight: "40vh", padding: "10px", border: "1px solid #ddd", borderRadius: "10px" }}
                    >
                      {responseHistory.length > 0 ? (
                        responseHistory
                          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                          .map((msg) => {
                            const isSelf = msg?.sender?.id === userId;
                            return (
                              <div key={msg.id} className={`chat-message-wrapper ${isSelf ? "self" : "other"}`}>
                                <div className={`chat-bubble ${isSelf ? "chat-self" : "chat-other"}`}>
                                  <div className="chat-header d-flex justify-content-between align-items-center">
                                    <div className="chat-author-bar pointer" onClick={() => navigate(`/profile/${msg.sender.id}`)}>
                                      <img
                                        src={
                                          msg.sender?.profile_picture?.startsWith('http')
                                            ? msg.sender.profile_picture
                                            : `https://res.cloudinary.com/daj7vkzdw/${msg.sender.profile_picture}`
                                        }
                                        alt="Avatar"
                                        className="chat-avatar"
                                      />
                                      <div className="chat-author-info">
                                        <strong>{msg.sender_name}</strong>
                                        <div className="text-muted small">
                                          {new Date(msg.created_at).toLocaleString([], {
                                            dateStyle: 'short',
                                            timeStyle: 'short'
                                          })}
                                        </div>
                                      </div>
                                    </div>

                                    {isSelf && (
                                      <BsDropdown className="chat-options">
                                        <BsDropdown.Toggle
                                          as="button"
                                          className="chat-options-btn border-0 bg-transparent"
                                        >
                                          ⋮
                                        </BsDropdown.Toggle>
                                        <BsDropdown.Menu align="end">
                                          <BsDropdown.Item onClick={() => handleEditMessage(msg)}>
                                            ✏️ Edit
                                          </BsDropdown.Item>
                                          <BsDropdown.Item
                                            className="text-danger"
                                            onClick={() => handleDeleteMessage(msg.id)}
                                          >
                                            🗑 Delete
                                          </BsDropdown.Item>
                                        </BsDropdown.Menu>
                                      </BsDropdown>
                                    )}
                                  </div>

                                  <div className="chat-message-content">
                                    <p>{msg.content}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-muted">No messages yet.</p>
                      )}
                    </div>

                    <div className="message-input-wrapper mt-2 position-relative">
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Write a message..."
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        onFocus={() => setShowSendButton(true)}
                        onBlur={() => setTimeout(() => setShowSendButton(false), 200)}
                        style={{ paddingRight: "50px" }}
                      />
                      {showSendButton && responseMessage.trim() && (
                        <Button
                          type="button"
                          onClick={handleSendMessage}
                          className="comment-submit-btn position-absolute"
                          style={{ right: "10px", bottom: "10px" }}
                        >
                          ➤
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {/* Pending Buttons */}
                {selectedRequest.status === "pending" && (
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    {receivedRequests.find(r => r.id === selectedRequest.id) ? (
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
              </Modal.Body>
            </Modal>
          )}
        </>
      )}

      {/* Edit Message Modal */}
      {showEditModal && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Message</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <textarea
              className="form-control"
              value={editingMessage?.content}
              onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
              rows={3}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditMessage}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default SittingRequestsPage;
