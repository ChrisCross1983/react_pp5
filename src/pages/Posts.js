import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Spinner,
  Form,
  Alert,
  Container,
  Row,
  Col,
  Dropdown as BsDropdown,
  Modal,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { axiosReq } from "../api/axios";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { Badge as BsBadge } from "react-bootstrap";

const Posts = ({ posts, loading, error, setPosts }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editContent, setEditContent] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [postId, setPostId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSittingModal, setShowSittingModal] = useState(false);
  const [sittingMessage, setSittingMessage] = useState("");
  const [sittingPost, setSittingPost] = useState(null);
  const [alreadyRequestedPostIds, setAlreadyRequestedPostIds] = useState([]);
  const [alreadyRequestedRequests, setAlreadyRequestedRequests] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setCurrentUser(storedUser.toLowerCase());
    }
  }, []);


  useEffect(() => {
    const fetchSentRequests = async () => {
      try {
        const response = await axiosReq.get("/posts/requests/sent/");
        console.log("🚀 Sent Requests Response:", response.data);

        const results = response.data?.results || response.data || [];

        const postIds = results.map((req) => req.post);
        setAlreadyRequestedPostIds(postIds);
        setAlreadyRequestedRequests(results);
      } catch (err) {
        console.error("❌ Error fetching sent requests", err);
      }
    };
    fetchSentRequests();
  }, []);


  const handleLike = async (post) => {
    try {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                has_liked: !p.has_liked,
                likes_count: p.has_liked
                  ? p.likes_count - 1
                  : p.likes_count + 1,
              }
            : p
        )
      );

      post.has_liked
        ? await axiosReq.delete(`posts/${post.id}/like/`)
        : await axiosReq.post(`posts/${post.id}/like/`);
    } catch (err) {
      console.error("❌ Error liking post:", err);
    }
  };


  const handleEditPost = (post) => {
    setEditTitle(post.title || "");
    setEditContent(post.description || "");
    setEditCategory(post.category || "general");
    setEditImage(post.image || null);
    setPostId(post.id);
    setShowEditModal(true);
  };

  const handleSaveEditPost = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("❌ Title and description cannot be empty.");
      return;
    }
  
    setIsSaving(true);
  
    const formattedCategory =
      categoryMap[editCategory] || editCategory || "general";
  
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("category", formattedCategory);
      formData.append("description", editContent);
      if (editImage instanceof File) {
        formData.append("image", editImage);
      }
  
      const response = await axiosReq.put(`posts/${postId}/`, formData);
  
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((p) =>
          p.id === postId ? { ...p, ...response.data } : p
        );
        return updatedPosts.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
      });
  
      setShowEditModal(false);
      toast.success("✅ Post updated successfully!");
    } catch (err) {
      console.error("❌ Error updating post:", err.response?.data || err.message);
      const errorData = err.response?.data;
      const imgError = errorData?.image?.[0];
      const genericError = err.message || "Failed to update post.";
      toast.error(imgError || genericError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSittingRequestSubmit = async (postId) => {
    if (!sittingPost?.id) {
      toast.error("❌ No post selected for request.");
      return;
    }

    if (alreadyRequestedPostIds.includes(sittingPost.id)) {
      toast.info("🛑 Request already sent. No duplicate allowed.");
      return;
    }

    console.log("📨 Submitting request to", `/posts/${postId}/request/`, {
      post: postId,
      message: sittingMessage,
    });
    
    try {
      const res = await axiosReq.post(`/posts/${postId}/request/`, {
        post: postId,
        message: sittingMessage,
      });
      
      const newRequestId = res.data?.id;
      
      toast.success(
        <>
          ✅ Request sent successfully!{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer", color: "lightblue" }}
            onClick={() => navigate(`/sitting-requests?focus=${newRequestId}`)}
          >
            View it here
          </span>
        </>
      );      

      setAlreadyRequestedPostIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(sittingPost.id);
        return Array.from(newSet);
      });
    } catch (err) {
      console.error("❌ Error sending request", err);

      const detail = err.response?.data?.detail || "Failed to send request.";
      toast.error(`❌ ${detail}`);
    } finally {
      setSittingMessage("");
      setShowSittingModal(false);
      setSittingPost(null);
    }
  };

  const categoryMap = {
    offer: "offer",
    search: "search",
    general: "general",
  };

  const categoryColors = {
    "sitting offer": "success",
    "sitting request": "warning",
    "general": "primary",
  };

  const handleTextareaResize = (event) => {
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  return (
    <Container className="mt-4">
      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && posts.length === 0 ? (
        <Alert variant="info">No posts found.</Alert>
      ) : (
        <>
          <Row className="justify-content-center">
            {posts.map((post) => (
              <Col md={10} key={post.id} className="mb-4">
                <Card className="shadow-sm">
                  {/* Post Author Bar */}
                  <div className="post-author-bar">
                    <div className="post-author-info-container">
                    <img
                      src={
                        post.author_profile?.profile_picture?.includes('http')
                          ? post.author_profile.profile_picture
                          : `https://res.cloudinary.com/daj7vkzdw/${post.author_profile.profile_picture}`
                      }
                      alt="Profile"
                      className="post-author-avatar pointer"
                      onClick={() => navigate(`/profile/${post.author_profile?.id}`)}
                    />
                      <div className="post-author-info pointer" onClick={() => navigate(`/profile/${post.author_profile.id}`)}>
                        <strong>{post.author}</strong>
                        <p className="text-muted small">
                          {new Date(post.updated_at).toISOString().slice(0, 19) !== new Date(post.created_at).toISOString().slice(0, 19)
                            ? `Updated ${formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}`
                            : `Posted ${formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}`}
                        </p>
                      </div>
                    </div>

                    {/* Edit / Delete Post */}
                    {post?.is_owner && (
                      <BsDropdown className="post-options">
                        <BsDropdown.Toggle
                          as="button"
                          className="post-options-btn"
                        >
                          ⋮
                        </BsDropdown.Toggle>
                        <BsDropdown.Menu align="end">
                          <BsDropdown.Item onClick={() => handleEditPost(post)}>
                            ✏️ Edit
                          </BsDropdown.Item>
                          <BsDropdown.Item
                            onClick={() => {
                              setPostId(post.id);
                              setShowDeleteModal(true);
                            }}
                            className="text-danger"
                          >
                            🗑 Delete
                          </BsDropdown.Item>
                        </BsDropdown.Menu>
                      </BsDropdown>
                    )}
                  </div>

                  {/* Clickabel Post Image */}
                  <Link to={`/posts/${post.id}/`}>
                    <Card.Img
                      variant="top"
                      src={
                        post.image ||
                        "https://res.cloudinary.com/daj7vkzdw/image/upload/v1737570695/default_post_tuonop.jpg"
                      }
                      alt="Post Image"
                      className="post-image"
                    />
                  </Link>

                  {/* Post Content */}
                  <Card.Body>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      <strong>Category: </strong>
                      <BsBadge
                        bg={categoryColors[post.category] || "secondary"}
                        className="mb-2"
                      >
                        {post.category || "General"}
                      </BsBadge>
                    </Card.Subtitle>
                    <Card.Text>{post.description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                    <Button variant="primary" onClick={() => navigate(`/posts/${post.id}/`)}>
                      View Details
                    </Button>
                      {(post.category === "offer" || post.category === "search") && !post.is_owner && (
                        <Button
                          variant={
                            alreadyRequestedPostIds.includes(post.id)
                              ? "secondary"
                              : "outline-primary"
                          }
                          title={
                            alreadyRequestedPostIds.includes(post.id)
                              ? "Request already sent"
                              : ""
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                          
                            const alreadyRequested = alreadyRequestedPostIds.includes(post.id);
                            const matchingRequest = alreadyRequestedRequests.find(
                              (req) => req.post === post.id
                            );
                          
                            console.log("📌 Requested postIds:", alreadyRequestedPostIds);
                            console.log("🔎 Checking post:", post.id, "| Already requested:", alreadyRequested);
                            console.log("🎯 Matching request:", matchingRequest);
                          
                            if (alreadyRequested) {
                              toast.info(
                                <>
                                  🕓 You already sent a request.{" "}
                                  <span
                                    onClick={() =>
                                      navigate(`/sitting-requests?focus=${matchingRequest?.id}`)
                                    }
                                    style={{
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                      color: "lightblue"
                                    }}
                                  >
                                    View it here
                                  </span>
                                </>,
                                { autoClose: 6000 }
                              );
                              return;
                            }
                          
                            setSittingPost(post);
                            setShowSittingModal(true);
                          }}                          
                          style={
                            alreadyRequestedPostIds.includes(post.id)
                              ? {
                                  pointerEvents: "auto",
                                  opacity: 0.6,
                                  cursor: "not-allowed",
                                }
                              : {}
                          }
                        >
                          🙋 {post.category === "offer" ? "Request Sitting" : "Offer Sitting"}
                        </Button>
                      )}
                    </div>

                    {/* Like & Comment Buttons */}
                    <div className="post-actions">
                      <button
                        className={`like-button ${
                          post.has_liked ? "active" : ""
                        }`}
                        onClick={() => handleLike(post)}
                      >
                        {post.has_liked ? "❤️" : "🤍"} {post.likes_count}
                      </button>
                      <button
                        className="comment-button"
                        onClick={() => navigate(`/posts/${post.id}/`)}
                      >
                        💬 {post.comments_count}
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Post Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <label>Category</label>
                <select
                  value={editCategory || "general"}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  <option value="offer">Sitting Offer</option>
                  <option value="search">Sitting Request</option>
                  <option value="general">General</option>
                </select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditPost} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Delete Post Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this post?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={async () => {
            try {
              await axiosReq.delete(`posts/${postId}/`, {
                headers: { "X-CSRFToken": localStorage.getItem("csrfToken") },
              });
              setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
              toast.success("✅ Post deleted successfully!");
            } catch (err) {
              toast.error("❌ Failed to delete post.");
              console.error(err);
            } finally {
              setShowDeleteModal(false);
            }
          }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sitting Request Modal */}
      {showSittingModal && sittingPost && (
        <Modal
          show={showSittingModal}
          onHide={() => {
            setShowSittingModal(false);
            setSittingPost(null);
            setSittingMessage("");
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>🙋 Sitting Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="sittingRequestMessage">
                <Form.Label>Optional message:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={sittingMessage}
                  onChange={(e) => setSittingMessage(e.target.value)}
                  placeholder="Write something for the receiver..."
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSittingModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!sittingPost) {
                  toast.error("❌ No valid post for request.");
                  return;
                }
                handleSittingRequestSubmit(sittingPost.id);
              }}
            >
              Send Request
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default Posts;
