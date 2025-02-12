import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Dropdown,
  Spinner,
  Alert,
  Form,
  Modal,
  Container,
  Row,
  Badge,
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
  const [isVisible, setIsVisible] = useState(true);
  const [visibleComments, setVisibleComments] = useState(5);
  const [isSubmitVisible, setIsSubmitVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const commentInputRef = useRef(null);
  const [editCategory, setEditCategory] = useState("general");

  useEffect(() => {
    if (post && post.category) {
      setEditCategory(post.category);
    }
  }, [post]);

  // Button functionality
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY <= 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const categoryColors = {
    "sitting offer": "success",
    "sitting request": "warning",
    general: "primary",
  };

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
    console.log("📌 Updated Post Data:", {
      editImage,
      editTitle,
      editCategory,
      editContent,
    });

    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("category", editCategory);
      formData.append("description", editContent);

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

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <Container className="mt-4">
      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {post && (
        <Row className="justify-content-center">
          {/* Main Section - Post & Comments */}
          <Col lg={6} md={12}>
            {/* Floating Back Button */}
            <Button
              className={`floating-back-btn ${isVisible ? "" : "hidden"}`}
              onClick={() => navigate(-1)}
            >
              ←
            </Button>

            {/* Post Author Bar */}
            <Card className="shadow-sm p-3 mb-4">
              <div className="post-author-bar">
                <div className="post-author-info-container">
                  <img
                    src={
                      post.author_image ||
                      "https://res.cloudinary.com/daj7vkzdw/image/upload/v1737570810/default_profile_uehpos.jpg"
                    }
                    alt="Profile"
                    className="post-author-avatar"
                  />
                  <div className="post-author-info">
                    <strong>{post.author}</strong>
                    <p className="text-muted small">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                {/* 🌟 3 Point Menu */}
                {post?.is_owner && (
                  <Dropdown
                    show={showDropdown}
                    onToggle={setShowDropdown}
                    className="post-options"
                  >
                    <Dropdown.Toggle
                      as="button"
                      className="post-options-btn"
                      onClick={toggleDropdown}
                    >
                      ⋮
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end">
                      <Dropdown.Item
                        onClick={() => {
                          setEditTitle(post.title);
                          setEditContent(post.description);
                          setEditImage(post.image);
                          setEditCategory(post.category || "general");
                          setShowEditModal(true);
                          setShowDropdown(false);
                        }}
                      >
                        ✏️ Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={handleDeletePost}
                        className="text-danger"
                      >
                        🗑 Delete
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>

              {/* Post Picture */}
              <Card.Img
                variant="top"
                src={
                  post.image ||
                  "https://res.cloudinary.com/daj7vkzdw/image/upload/v1737570810/default_profile_uehpos.jpg"
                }
                alt="Post Image"
                className="post-image"
              />

              {/* 🖤 Like & Comment Buttons */}
              <div className="post-actions">
                <button
                  className={`like-button ${post.has_liked ? "active" : ""}`}
                  onClick={handleLike}
                  disabled={isLiking}
                >
                  {post.has_liked ? "❤️" : "🤍"} {post.likes_count}
                </button>

                <button
                  className="comment-button"
                  onClick={() => {
                    if (commentInputRef.current) {
                      commentInputRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      commentInputRef.current.focus();
                    }
                  }}
                >
                  💬 {comments.length}
                </button>
              </div>

              <Card.Body>
                <Card.Title className="mt-3">{post.title}</Card.Title>
                <Badge
                  bg={categoryColors[post.category] || "secondary"}
                  className="mb-2"
                >
                  {post.category || "General"}
                </Badge>
                <Card.Text>{post.description}</Card.Text>
              </Card.Body>
            </Card>

            {/* Comments under Post */}
            <Row>
              <Col xs={12}>
                <Card className="shadow-sm p-3">
                  <Card.Title>💬 Comments</Card.Title>

                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newComment.trim()) return;

                      axiosReq
                        .post(`posts/${postId}/comment/`, {
                          content: newComment,
                          post: postId,
                        })
                        .then((response) => {
                          console.log(
                            "✅ New comment saved successfully:",
                            response.data
                          );
                          setComments((prevComments) => [
                            response.data,
                            ...prevComments,
                          ]);
                          setNewComment("");
                        })
                        .catch((err) => {
                          console.error(
                            "❌ Error while saving comment:",
                            err.response?.data || err.message
                          );
                        });
                    }}
                    className="mt-3 position-relative"
                  >
                    <Form.Group className="position-relative">
                      <Form.Control
                        id="comment-input"
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        ref={commentInputRef}
                      />
                      {/* Dynamic Send Button */}
                      {newComment.trim().length > 0 && (
                        <Button type="submit" className="comment-submit-btn">
                          ➤
                        </Button>
                      )}
                    </Form.Group>
                  </Form>

                  {comments.length === 0 ? (
                    <p className="mt-3 text-muted">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    <>
                      {comments.slice(0, visibleComments).map((comment) => (
                        <Card key={comment.id} className="mt-2 p-2 shadow-sm">
                          <div className="comment-header">
                            <img
                              src={
                                comment.author_image ||
                                "https://res.cloudinary.com/daj7vkzdw/image/upload/v1737570810/default_profile_uehpos.jpg"
                              }
                              alt="Profile"
                              className="comment-avatar"
                            />
                            <div className="comment-meta">
                              <strong className="text-primary">
                                {comment.author}
                              </strong>
                              <p className="text-muted small">
                                {formatDistanceToNow(
                                  new Date(comment.created_at),
                                  { addSuffix: true }
                                )}
                              </p>
                            </div>
                          </div>
                          <p className="mb-1">{comment.content}</p>
                          {isSubmitVisible && (
                            <Button
                              type="submit"
                              className="comment-submit-btn"
                            >
                              ➤
                            </Button>
                          )}

                          {/* 🛠 Edit & Delete Comments */}
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
                          onClick={() =>
                            setVisibleComments(visibleComments + 5)
                          }
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
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  <option value="sitting offer">Sitting Offer</option>
                  <option value="sitting request">Sitting Request</option>
                  <option value="general">General</option>
                </Form.Select>
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
