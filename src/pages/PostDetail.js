import React, { useRef, useState, useEffect } from "react";
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
import { Badge as BsBadge, Dropdown as BsDropdown } from "react-bootstrap";
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
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState(
    () => post?.category || "general"
  );
  const [editImage, setEditImage] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [visibleComments, setVisibleComments] = useState(5);
  const [isSubmitVisible, setIsSubmitVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const commentInputRef = useRef(null);

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
        console.log("📌 API Response Data:", response.data);
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

  useEffect(() => {
    if (post) {
      setEditTitle(post.title || "");
      setEditContent(post.description || "");
      setEditCategory(post.category || "general");
      setEditImage(post.image || null);
    }
  }, [post]);

  const categoryColors = {
    "sitting offer": "success",
    "sitting request": "warning",
    general: "primary",
  };

  const categoryMap = {
    offer: "offer",
    search: "search",
    general: "general",
  };

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
  console.log("📌 Post Data:", post);
  console.log("📌 Edit Modal State:", showEditModal);
  console.log("📌 Edit Modal Values:", {
    editTitle,
    editContent,
    editCategory,
    editImage,
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
    console.log("📌 Updated Post Data:", {
      editImage,
      editTitle,
      editCategory,
      editContent,
    });

    const formattedCategory =
      categoryMap[editCategory] || editCategory || "general";
    console.log("🔍 categoryMap check:", editCategory, "->", formattedCategory);

    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("category", formattedCategory);
      formData.append("description", editContent);

      if (editImage instanceof File) {
        formData.append("image", editImage);
      }
      console.log(
        "🔍 categoryMap check:",
        editCategory,
        "->",
        categoryMap[editCategory]
      );
      console.log(
        "📤 Sending this FormData:",
        Object.fromEntries(formData.entries())
      );

      const response = await axiosReq.put(`posts/${postId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Post successfully updated:", response.data);
      setPost((prevPost) => ({
        ...prevPost,
        title: response.data.title,
        category: response.data.category,
        description: response.data.description,
        image: response.data.image,
      }));
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

  const handleTextareaResize = (event) => {
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

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

                {/* 3 Point Menu Posts*/}
                {post?.is_owner && (
                  <BsDropdown
                    show={showDropdown}
                    onToggle={setShowDropdown}
                    className="post-options"
                  >
                    <BsDropdown.Toggle
                      as="button"
                      className="post-options-btn"
                      onClick={toggleDropdown}
                    >
                      ⋮
                    </BsDropdown.Toggle>
                    <BsDropdown.Menu align="end">
                      <BsDropdown.Item
                        onClick={() => {
                          if (!post) return;
                          setEditTitle(post.title || "");
                          setEditContent(post.description || "");
                          setEditImage(post.image || null);
                          setEditCategory(post.category || "general");
                          setShowEditModal(true);
                          console.log(
                            "📌 Setting editCategory before modal open:",
                            post?.category
                          );
                          setShowDropdown(false);
                        }}
                      >
                        ✏️ Edit
                      </BsDropdown.Item>
                      <BsDropdown.Item
                        onClick={handleDeletePost}
                        className="text-danger"
                      >
                        🗑 Delete
                      </BsDropdown.Item>
                    </BsDropdown.Menu>
                  </BsDropdown>
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
                <BsBadge
                  bg={categoryColors[post.category] || "secondary"}
                  className="mb-2"
                >
                  {post.category || "General"}
                </BsBadge>
                <Card.Text>
                  <strong>Category: </strong>
                  {post.category}
                </Card.Text>
                <Card.Text>{post.description}</Card.Text>
              </Card.Body>
            </Card>

            {/* Comments under Post */}
            <Row>
              <Col xs={12}>
                <Card className="shadow-sm p-3">
                  <Card.Title>💬 Comments</Card.Title>
                  {/* If there are no comments */}
                  {comments.length === 0 && (
                    <p className="mt-3 text-muted text center">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                  {/* Comment input field with Send Button */}
                  <Form
                    className="comment-input"
                    onSubmit={handleCommentSubmit}
                  >
                    <Form.Control
                      as="textarea"
                      rows={1}
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => {
                        setNewComment(e.target.value);
                        setIsSubmitVisible(e.target.value.trim().length > 0);
                      }}
                      onInput={handleTextareaResize}
                      style={{
                        resize: "none",
                        overflowY: "hidden",
                        minHeight: "40px",
                      }}
                    />
                    {isSubmitVisible && (
                      <Button
                        type="submit"
                        variant="primary"
                        className="comment-submit-btn"
                        style={{
                          opacity: 1,
                          transition: "opacity 0.3s ease-in-out",
                        }}
                      >
                        ➤
                      </Button>
                    )}
                  </Form>

                  {/* Comments List */}
                  {comments.slice(0, visibleComments).map((comment) => (
                    <div
                      key={comment.id}
                      className={`comment ${
                        comment.is_owner ? "comment-own" : ""
                      }`}
                    >
                      {/* Author Bar for comments */}
                      <div
                        className="comment-author-bar"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={
                            comment.author_image ||
                            "https://res.cloudinary.com/daj7vkzdw/image/upload/v1737570810/default_profile_uehpos.jpg"
                          }
                          alt="Profile"
                          className="comment-avatar"
                        />
                        <div
                          className="comment-author-info"
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <strong>{comment.author}</strong>
                            <p
                              className="text-muted small"
                              style={{ margin: 0 }}
                            >
                              {formatDistanceToNow(
                                new Date(comment.created_at),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                          <p
                            className="comment-content"
                            style={{ marginTop: "5px" }}
                          >
                            {comment.content}
                          </p>
                        </div>
                      </div>

                      {/* 3-Point-Menu for Edit / Delete realized comments */}
                      {comment.is_owner && (
                        <BsDropdown className="comment-options">
                          <BsDropdown.Toggle
                            as="button"
                            className="comment-options-btn"
                            style={{
                              background: "none",
                              border: "none",
                              padding: "5px",
                              cursor: "pointer",
                            }}
                          >
                            ⋮
                          </BsDropdown.Toggle>
                          <BsDropdown.Menu
                            align="end"
                            style={{ borderRadius: "8px", minWidth: "120px" }}
                          >
                            <BsDropdown.Item
                              onClick={() => handleEditComment(comment)}
                            >
                              ✏️ Edit
                            </BsDropdown.Item>
                            <BsDropdown.Item
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-danger"
                            >
                              🗑 Delete
                            </BsDropdown.Item>
                          </BsDropdown.Menu>
                        </BsDropdown>
                      )}
                    </div>
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
