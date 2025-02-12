import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  Modal,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { axiosReq } from "../api/axios";
import { formatDistanceToNow } from "date-fns";

const PostDetail = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentEditModal, setShowCommentEditModal] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [visibleComments, setVisibleComments] = useState(5);

  // Fetch Post Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosReq.get(`posts/${postId}/`);
        setPost(response.data);
      } catch (err) {
        console.error(
          "❌ Error fetching post:",
          err.response?.data || err.message
        );
        setError("Failed to load the post.");
      }
      setLoading(false);
    };

    fetchData();
  }, [postId]);

  // Fetch Comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosReq.get(`posts/${postId}/comments/`);
        setComments(response.data.results);
      } catch (err) {
        console.error(
          "❌ Error loading comments:",
          err.response?.data || err.message
        );
      }
    };

    fetchComments();
  }, [postId]);

  // Debugging Logs
  console.log("📌 Check Post Data before rendering:", post);
  console.log("📌 Check Modals state:", {
    showEditModal,
    showCommentEditModal,
  });

  //  Error handling: If `post === null`
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading post...</p>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error || "Post not found."}</Alert>
      </Container>
    );
  }

  const handleLike = async () => {
    if (post?.has_liked) {
      try {
        await axiosReq.delete(`posts/${postId}/like/`, {
          headers: { "X-CSRFToken": localStorage.getItem("csrfToken") },
        });

        setPost((prevPost) => ({
          ...prevPost,
          has_liked: false,
          likes_count: prevPost.likes_count - 1,
        }));
      } catch (err) {
        console.error("❌ Error unliking post:", err);
      }
    } else {
      try {
        await axiosReq.post(
          `posts/${postId}/like/`,
          {},
          { headers: { "X-CSRFToken": localStorage.getItem("csrfToken") } }
        );

        setPost((prevPost) => ({
          ...prevPost,
          has_liked: true,
          likes_count: prevPost.likes_count + 1,
        }));
      } catch (err) {
        console.error("❌ Error liking post:", err);
      }
    }
    setIsLiking(false);
  };

  const handleEditPost = async () => {
    console.log("📤 Sending PUT request...");
    console.log("📌 Updated Post Data:", { editTitle, editContent, editImage });

    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("description", editContent);
      formData.append("category", post.category);

      if (editImage instanceof File) {
        formData.append("image", editImage);
      }

      const response = await axiosReq.put(`posts/${postId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Post successfully updated:", response.data);
      setPost(response.data);
      setShowEditModal(false);
    } catch (err) {
      console.error(
        "❌ Error editing post:",
        err.response?.data || err.message
      );
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axiosReq.delete(`posts/${postId}/`, {
        headers: { "X-CSRFToken": localStorage.getItem("csrfToken") },
      });
      alert("Post deleted successfully.");
      navigate("/");
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axiosReq.post(
        `posts/${postId}/comment/`,
        { content: newComment, post: postId },
        { headers: { "X-CSRFToken": localStorage.getItem("csrfToken") } }
      );

      console.log("✅ New comment saved succesfully:", response.data);
      setComments((prevComments) => [response.data, ...prevComments]);
      setNewComment("");
    } catch (err) {
      console.error(
        "❌ Error while saving comment:",
        err.response?.data || err.message
      );
    }
  };

  const handleEditComment = (comment) => {
    setEditCommentId(comment.id);
    setEditCommentContent(comment.content);
    setShowCommentEditModal(true);
  };

  const handleSaveEditComment = async () => {
    try {
      const response = await axiosReq.put(
        `posts/comments/${editCommentId}/`,
        { content: editCommentContent, post: postId },
        { headers: { "X-CSRFToken": localStorage.getItem("csrfToken") } }
      );

      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === editCommentId ? { ...c, content: response.data.content } : c
        )
      );
      setShowCommentEditModal(false);
    } catch (err) {
      console.error(
        "❌ Error updating comment:",
        err.response?.data || err.message
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await axiosReq.delete(`posts/comments/${commentId}/`);
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== commentId)
      );
      alert("Comment deleted successfully.");
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <Container className="mt-4">
      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {post && (
        <Row className="justify-content-center">
          {/* Left sidebar - Widgets */}
          <Col lg={3} className="d-none d-lg-block">
            <Card className="shadow-sm p-3 mb-4">
              <Card.Title>🔥 Top Followed</Card.Title>
              <p>Coming soon...</p>
            </Card>
          </Col>

          {/* Main Section - Post & Comments */}
          <Col lg={6} md={12}>
            {/* 🔙 Back Button */}
            <Button
              variant="link"
              className="text-dark mb-3"
              onClick={() => navigate(-1)}
              style={{ fontSize: "1.5rem", textDecoration: "none" }}
            >
              ← Back
            </Button>

            {/* Posts */}
            <Card className="shadow-sm p-3 mb-4">
              <Card.Img
                variant="top"
                src={
                  post.image ||
                  "https://res.cloudinary.com/daj7vkzdw/image/upload/v1737570810/default_profile_uehpos.jpg"
                }
                alt="Post Image"
                className="img-fluid mb-3 rounded"
                style={{
                  objectFit: "cover",
                  maxHeight: "400px",
                }}
              />
              <Card.Body>
                <div className="d-flex align-items-center">
                  <img
                    src={
                      post.author_image ||
                      "https://res.cloudinary.com/daj7vkzdw/image/upload/v1737570810/default_profile_uehpos.jpg"
                    }
                    alt="Profile"
                    className="rounded-circle border me-2"
                    width="40"
                    height="40"
                  />
                  <div>
                    <strong>{post.author}</strong>
                    <p className="text-muted small">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <Card.Title className="mt-3">{post.title}</Card.Title>
                <Card.Text>{post.description}</Card.Text>

                {/* Like & Actions */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <Button
                    variant="outline-primary"
                    onClick={handleLike}
                    disabled={isLiking}
                  >
                    ❤️ {post.likes_count}
                  </Button>
                  {post?.is_owner && (
                    <div>
                      <Button
                        variant="outline-warning"
                        className="me-2"
                        onClick={() => {
                          setEditTitle(post.title);
                          setEditContent(post.description);
                          setEditImage(post.image);
                          setShowEditModal(true);
                        }}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={handleDeletePost}
                      >
                        🗑 Delete
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Comments under Post */}
            <Row>
              <Col xs={12}>
                <Card className="shadow-sm p-3">
                  <Card.Title>💬 Comments</Card.Title>

                  <Form onSubmit={handleCommentSubmit} className="mt-3">
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                    </Form.Group>
                    <Button type="submit" className="mt-2 w-100" variant="primary">
                      Post Comment
                    </Button>
                  </Form>

                  {comments.length === 0 ? (
                    <p className="mt-3 text-muted">No comments yet. Be the first to comment!</p>
                  ) : (
                    <>
                      {comments.slice(0, visibleComments).map((comment) => (
                        <Card key={comment.id} className="mt-2 p-2 shadow-sm">
                          <div className="d-flex align-items-center p-2">
                            <img
                              src={comment.author_image || "https://res.cloudinary.com/daj7vkzdw/image/upload/v1737570810/default_profile_uehpos.jpg"}
                              alt="Profile"
                              className="rounded-circle border me-2"
                              width="40"
                              height="40"
                            />
                            <div className="flex-grow-1">
                              <strong className="text-primary">{comment.author}</strong>
                              <p className="text-muted small">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </p>
                              <p className="mb-1">{comment.content}</p>
                            </div>
                          </div>

                          {/* 🛠 Edit & Delete */}
                          {comment.is_owner && (
                            <div className="d-flex justify-content-end">
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEditComment(comment)}
                              >
                                ✏️ Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                🗑 Delete
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))}

                      {/* "More..." Button */}
                      {comments.length > visibleComments && (
                        <Button
                          variant="link"
                          className="mt-2 w-100"
                          onClick={() => setVisibleComments(visibleComments + 5)}
                        >
                          More...
                        </Button>
                      )}
                    </>
                  )}
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
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
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
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
            <Button variant="primary" onClick={handleEditPost}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit Comment Modal */}
      <Modal
        show={showCommentEditModal}
        onHide={() => setShowCommentEditModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={3}
            value={editCommentContent}
            onChange={(e) => setEditCommentContent(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCommentEditModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEditComment}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PostDetail;
