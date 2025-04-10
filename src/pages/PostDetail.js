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
import { toast } from "react-toastify";

const PostDetail = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [isLiking, setIsLiking] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentEditModal, setShowCommentEditModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState(
    () => post?.category || "general"
  );
  const [editImage, setEditImage] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitVisible, setIsSubmitVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const MAX_REPLIES_SHOWN = 3;
  const commentInputRef = useRef(null);
  const commentRefs = useRef({});


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
    "general": "primary",
  };

  const categoryMap = {
    offer: "offer",
    search: "search",
    general: "general",
  };

  // Fetch Comments
  useEffect(() => {
    const loadComments = async () => {
      if (!hasMoreComments || isLoadingComments) return;
  
      setIsLoadingComments(true);
      try {
        const res = await axiosReq.get(`/comments/?post=${postId}&page=${commentsPage}`);
        setComments((prev) => [...prev, ...res.data.results]);
        setHasMoreComments(Boolean(res.data.next));

        // Read comment ID from URL and reload
        const query = new URLSearchParams(window.location.search);
        const commentId = query.get("comment");
        if (commentId) {
          setTimeout(() => {
            const el = commentRefs.current[commentId];
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 500);
        }

      } catch (err) {
        console.error("❌ Error loading comments:", err);
      } finally {
        setIsLoadingComments(false);
      }
    };
  
    loadComments();
  }, [commentsPage, postId]);


  // Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      const bottomReached = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottomReached && hasMoreComments && !isLoadingComments) {
        setCommentsPage((prevPage) => prevPage + 1);
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMoreComments, isLoadingComments]);


  useEffect(() => {
    if (post && comments.length !== post.comments_count) {
      setPost((prevPost) => ({
        ...prevPost,
        comments_count: comments.length,
      }));
    }
  }, [comments, post]);
  

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
    setIsLiking(true);
    if (post?.has_liked) {
      try {
        await axiosReq.delete(`posts/${postId}/like/`, {
          headers: { "X-CSRFToken": localStorage.getItem("csrfToken") },
        });

        setPost((prevPost) => ({
          ...prevPost,
          has_liked: false,
          likes_count: prevPost.likes_count - 1,
          like_id: null,
        }));
      } catch (err) {
        console.error("❌ Error unliking post:", err);
      }
    } else {
      try {
        const res = await axiosReq.post(
          `posts/${postId}/like/`,
          {},
          { headers: { "X-CSRFToken": localStorage.getItem("csrfToken") } }
        );

        setPost((prevPost) => ({
          ...prevPost,
          has_liked: true,
          likes_count: prevPost.likes_count + 1,
          like_id: res.data.id,
        }));
      } catch (err) {
        console.error("❌ Error liking post:", err);
      }
    }
    setIsLiking(false);
  };

  const handleEditPost = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("category", categoryMap[editCategory] || "general");
      formData.append("description", editContent);
      if (editImage instanceof File) {
        formData.append("image", editImage);
      }
  
      const response = await axiosReq.put(`posts/${postId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setPost((prevPost) => ({
        ...prevPost,
        title: response.data.title,
        category: response.data.category,
        description: response.data.description,
        image: response.data.image,
        updated_at: response.data.updated_at,
      }));
  
      setShowEditModal(false);
  
      toast.success("✅ Post updated successfully!");
    } catch (err) {
      console.error("❌ Error editing post:", err.response?.data || err.message);
      toast.error("❌ Failed to update post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await axiosReq.delete(`posts/${postId}/`, {
        headers: { "X-CSRFToken": localStorage.getItem("csrfToken") },
      });
      toast.success("✅ Post deleted successfully!");
      navigate("/");
    } catch (err) {
      toast.error("❌ Failed to delete post.");
      console.error("❌ Error deleting post:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axiosReq.post(
        `/comments/`,
        { content: newComment, post: postId },
        { headers: { "X-CSRFToken": localStorage.getItem("csrfToken") } }
      );

      console.log("✅ New comment saved succesfully:", response.data);

      setComments((prevComments) => [response.data, ...prevComments]);
      setPost((prev) => ({
        ...prev,
        comments_count: prev.comments_count + 1,
      }));      
      setNewComment("");
      setIsSubmitVisible(false);
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
    setIsSavingComment(true);
    try {
      const response = await axiosReq.put(
        `/comments/${editCommentId}/`,
        { content: editCommentContent, post: postId },
        { headers: { "X-CSRFToken": localStorage.getItem("csrfToken") } }
      );
  
      setComments((prevComments) =>
        prevComments.map((c) => {
          if (c.id === editCommentId) {
            return {
              ...c,
              content: response.data.content,
              updated_at: response.data.updated_at,
            };
          }
      
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === editCommentId
                ? {
                    ...r,
                    content: response.data.content,
                    updated_at: response.data.updated_at,
                  }
                : r
            ),
          };
        })
      );

      setShowCommentEditModal(false);
      toast.success("✅ Comment updated successfully!");
    } catch (err) {
      console.error(
        "❌ Error updating comment:",
        err.response?.data || err.message
      );
      toast.error("❌ Failed to update comment.");
    } finally {
      setIsSavingComment(false);
    }
  };

  const handleReplySubmit = async (commentId) => {
    try {
      const response = await axiosReq.post(`/comments/`, {
        post: postId,
        content: replyContent[commentId],
        parent: commentId,
      });
  
      setReplyContent({ ...replyContent, [commentId]: "" });
      setShowReplyForm({ ...showReplyForm, [commentId]: false });
  
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [
                {
                  ...response.data,
                  is_owner: true,
                },
                ...(c.replies || []),
              ],
            };
          }
          return c;
        })
      );
  
      toast.success("✅ Reply posted!");
    } catch (err) {
      console.error("❌ Failed to reply:", err);
      toast.error("❌ Failed to reply.");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const liked = comments.some(c => c.id === commentId ? !c.has_liked : c.replies?.some(r => r.id === commentId && !r.has_liked));
    
      await axiosReq.post(`/comments/${commentId}/like/`);
      toast[liked ? "success" : "error"](liked ? "👍 Liked" : "💔 Unliked");

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const liked = !c.has_liked;
            return {
              ...c,
              has_liked: liked,
              likes_count: liked
                ? c.likes_count + 1
                : c.likes_count - 1,
            };
          }
  
          return {
            ...c,
            replies: c.replies.map((r) => {
              if (r.id === commentId) {
                const liked = !r.has_liked;
                return {
                  ...r,
                  has_liked: liked,
                  likes_count: liked
                    ? r.likes_count + 1
                    : r.likes_count - 1,
                };
              }
              return r;
            }),
          };
        })
      );
    } catch (err) {
      toast.error("❌ Like failed");
      console.error("Like error:", err);
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
                      {new Date(post.updated_at).toISOString().slice(0, 19) !== new Date(post.created_at).toISOString().slice(0, 19)
                        ? `Updated ${formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}`
                        : `Posted ${formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}`}
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

              {/* Like & Comment Buttons */}
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
                      commentInputRef.current.classList.add("highlight-comment");
                      setTimeout(() => {
                        commentInputRef.current.classList.remove("highlight-comment");
                      }, 1000);
                    }
                  }}
                >
                  💬 {post.comments_count}
                </button>
              </div>

              <Card.Body>
                <Card.Title className="mt-3">{post.title}</Card.Title>
                <Card.Text>
                  <strong>Category: </strong>
                  <BsBadge
                    bg={categoryColors[post.category] || "secondary"}
                    className="mb-2"
                  >
                    {post.category || "General"}
                  </BsBadge>
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
                      ref={commentInputRef}
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
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      ref={(el) => (commentRefs.current[comment.id] = el)}
                      className={`comment ${comment.is_owner ? "comment-own" : ""}`}
                    >
                      {/* Main comment */}
                      <div className="comment-header">
                        <div className="comment-info">
                          <img
                            src={comment.profile_image}
                            alt="Profile"
                            className="comment-avatar"
                          />
                          <div className="comment-meta">
                            <strong>{comment.author}</strong>
                            <p className="text-muted small">
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* 3 point menu */}
                        {comment.is_owner && (
                          <BsDropdown className="comment-options">
                            <BsDropdown.Toggle as="button" className="comment-options-btn">⋮</BsDropdown.Toggle>
                            <BsDropdown.Menu align="end">
                              <BsDropdown.Item onClick={() => handleEditComment(comment)}>✏️ Edit</BsDropdown.Item>
                              <BsDropdown.Item className="text-danger" onClick={() => {
                                setCommentToDeleteId(comment.id);
                                setShowDeleteCommentModal(true);
                              }}>🗑 Delete</BsDropdown.Item>
                            </BsDropdown.Menu>
                          </BsDropdown>
                        )}
                      </div>

                      {/* Content */}
                      <div className="comment-body">
                        <p className="comment-content">{comment.content}</p>

                        <div className="mt-2 d-flex gap-2">
                          <Button
                            size="sm"
                            variant={comment.has_liked ? "primary" : "outline-primary"}
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            👍 Like <span className="text-muted">|</span> <span>{comment.likes_count}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() =>
                              setShowReplyForm((prev) => ({
                                ...prev,
                                [comment.id]: !prev[comment.id],
                              }))
                            }
                          >
                            ↩ Reply
                          </Button>
                        </div>

                        {/* Reply form */}
                        {showReplyForm[comment.id] && (
                          <Form className="comment-input mt-2" onSubmit={(e) => {
                            e.preventDefault();
                            handleReplySubmit(comment.id);
                          }}>
                            <Form.Control
                              as="textarea"
                              rows={1}
                              placeholder="Write a reply..."
                              value={replyContent[comment.id] || ""}
                              onChange={(e) =>
                                setReplyContent({
                                  ...replyContent,
                                  [comment.id]: e.target.value,
                                })
                              }
                              onInput={handleTextareaResize}
                              style={{
                                resize: "none",
                                overflowY: "hidden",
                                minHeight: "40px",
                              }}
                            />
                            {replyContent[comment.id]?.trim() && (
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
                        )}

                        {/* REPLIES (level 2) */}
                        {comment.replies?.length > 0 && (
                          <div className="mt-3 ms-4 ps-3 border-start border-secondary-subtle">
                            {(
                              expandedReplies[comment.id]
                                ? comment.replies
                                : comment.replies.slice(0, MAX_REPLIES_SHOWN)
                            ).map((reply) => (
                              <div key={reply.id} className="reply">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="d-flex align-items-start gap-2">
                                    <img
                                      src={reply.profile_image}
                                      alt="Reply Avatar"
                                      className="comment-avatar-sm"
                                    />
                                    <div>
                                      <strong>{reply.author}</strong>{" "}
                                      <span className="text-muted small">
                                        {new Date(reply.created_at).toLocaleString()}
                                      </span>
                                      <p className="comment-content mb-2">{reply.content}</p>
                                      <Button
                                        size="sm"
                                        variant={reply.has_liked ? "primary" : "outline-primary"}
                                        onClick={() => handleLikeComment(reply.id)}
                                      >
                                        👍 Like <span className="text-muted">|</span> <span>{reply.likes_count}</span>
                                      </Button>
                                    </div>
                                  </div>

                                  {/* 3 point menu */}
                                  {reply.is_owner && (
                                    <BsDropdown className="comment-options ms-2">
                                      <BsDropdown.Toggle
                                        as="button"
                                        className="comment-options-btn"
                                      >
                                        ⋮
                                      </BsDropdown.Toggle>
                                      <BsDropdown.Menu align="end">
                                        <BsDropdown.Item onClick={() => handleEditComment(reply)}>
                                          ✏️ Edit
                                        </BsDropdown.Item>
                                        <BsDropdown.Item
                                          className="text-danger"
                                          onClick={() => {
                                            setCommentToDeleteId(reply.id);
                                            setShowDeleteCommentModal(true);
                                          }}
                                        >
                                          🗑 Delete
                                        </BsDropdown.Item>
                                      </BsDropdown.Menu>
                                    </BsDropdown>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Show more/less replies */}
                            {comment.replies.length > MAX_REPLIES_SHOWN && (
                              <div className="mt-2">
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="ps-0"
                                  onClick={() =>
                                    setExpandedReplies((prev) => ({
                                      ...prev,
                                      [comment.id]: !prev[comment.id],
                                    }))
                                  }
                                >
                                  {expandedReplies[comment.id]
                                    ? "Hide replies"
                                    : `See ${comment.replies.length - MAX_REPLIES_SHOWN} more replies`}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
            <Button variant="primary" onClick={handleEditPost} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
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
          <Button
            variant="primary"
            onClick={handleSaveEditComment}
            disabled={isSavingComment}
          >
            {isSavingComment ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Comment Modal */}
      <Modal
        show={showDeleteCommentModal}
        onHide={() => setShowDeleteCommentModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Comment Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this comment?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteCommentModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await axiosReq.delete(`/comments/${commentToDeleteId}/`);
                setComments((prevComments) =>
                  prevComments
                    .map((c) => {
                      if (c.id === commentToDeleteId) {
                        return null;
                      }
                
                      const updatedReplies = c.replies?.filter((r) => r.id !== commentToDeleteId);
                      return {
                        ...c,
                        replies: updatedReplies,
                      };
                    })
                    .filter(Boolean)
                );
                setPost((prevPost) => ({
                  ...prevPost,
                  comments_count: prevPost.comments_count - 1,
                }));                
                toast.success("✅ Comment deleted successfully!");
              } catch (err) {
                toast.error("❌ Failed to delete comment.");
              } finally {
                setShowDeleteCommentModal(false);
              }
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PostDetail;
