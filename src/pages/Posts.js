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
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { axiosReq } from "../api/axios";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Posts = ({ posts, loading, error, setPosts }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [showCommentEditModal, setShowCommentEditModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editContent, setEditContent] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [postId, setPostId] = useState(null);
  const [isSubmitVisible, setIsSubmitVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setCurrentUser(storedUser.toLowerCase());
    }
  }, []);

  const toggleComments = async (post) => {
    if (!currentUser) {
      console.warn("⏳ Waiting for currentUser to be set...");
      return;
    }

    try {
      console.log(`🔄 Loading comments for post ${post.id}...`);

      let allComments = [];
      let nextPageUrl = `posts/${post.id}/comments/?limit=100`;

      while (nextPageUrl) {
        const response = await axiosReq.get(nextPageUrl);
        allComments = [...allComments, ...response.data.results];
        nextPageUrl = response.data.next;
      }

      const fullComments = allComments.map((comment) => ({
        ...comment,
        is_owner: comment.author.toLowerCase() === currentUser,
      }));

      console.log(
        `✅ Loaded ${fullComments.length} comments for post ${post.id}`
      );

      setSelectedPost((prev) => ({
        ...prev,
        id: post.id,
        comments: fullComments,
        comments_count: prev?.comments_count ?? post.comments_count,
      }));

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id
            ? {
                ...p,
                comments: fullComments,
                comments_count: post.comments_count,
              }
            : p
        )
      );

      console.log(
        `✅ Comments updated for Post ${post.id} (Total: ${post.comments_count})`
      );
    } catch (err) {
      console.error("❌ Error loading comments:", err);
    }
  };

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      console.error("❌ Cannot submit comment: Comment text is empty!");
      return;
    }

    if (!selectedPost || !selectedPost.id) {
      console.error(
        "❌ Cannot submit comment: selectedPost is missing or has no ID!"
      );
      return;
    }

    try {
      console.log(
        `📤 Sending POST request to /posts/${selectedPost.id}/comment/...`
      );

      const response = await axiosReq.post(
        `posts/${selectedPost.id}/comment/`,
        { content: newComment, post: selectedPost.id }
      );

      console.log("✅ New comment saved successfully:", response.data);

      const newCommentData = {
        ...response.data,
        is_owner: response.data.author.toLowerCase() === currentUser,
      };

      setSelectedPost((prev) => ({
        ...prev,
        comments: [newCommentData, ...prev.comments],
      }));

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === selectedPost.id
            ? {
                ...p,
                comments: [newCommentData, ...p.comments],
                comments_count: (p.comments_count ?? 0) + 1,
              }
            : p
        )
      );

      setNewComment("");
      setIsSubmitVisible(false);
    } catch (err) {
      console.error(
        "❌ Error saving comment:",
        err.response?.data || err.message
      );
    }
  };

  const handleEditComment = (comment) => {
    if (!comment || !comment.id) {
      console.error("❌ Cannot edit comment: Missing comment or ID!");
      return;
    }

    console.log(`✏️ Editing comment ${comment.id}`);
    setEditCommentId(comment.id);
    setEditCommentContent(comment.content);
    setShowCommentEditModal(true);
  };

  const handleSaveEditComment = async () => {
    if (!editCommentId || !selectedPost?.id) return;
    setIsSavingComment(true);
  
    try {
      const response = await axiosReq.put(
        `posts/comments/${editCommentId}/`,
        { content: editCommentContent, post: selectedPost.id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
  
      setSelectedPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === editCommentId
            ? {
                ...c,
                content: response.data.content,
                is_owner:
                  response.data.author.toLowerCase() === currentUser,
              }
            : c
        ),
      }));
  
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

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await axiosReq.delete(`posts/comments/${commentId}/`);

      setSelectedPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      }));

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === selectedPost.id
            ? {
                ...p,
                comments: p.comments.filter((c) => c.id !== commentId),
                comments_count: p.comments_count - 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error("❌ Error deleting comment:", err);
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
  
      const response = await axiosReq.put(`posts/${postId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? { ...p, ...response.data } : p))
      );
  
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

  const handleDeletePost = async (postId) => {
    try {
      await axiosReq.delete(`posts/${postId}/`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("✅ Post deleted successfully!");
    } catch (err) {
      toast.error("❌ Failed to delete post.");
      console.error("❌ Error deleting post:", err);
    }
  };

  const categoryMap = {
    offer: "offer",
    search: "search",
    general: "general",
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
              <Col md={8} key={post.id} className="mb-4">
                <Card className="shadow-sm">
                  {/* Post Author Bar */}
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
                      {post.category || "Unknown"}
                    </Card.Subtitle>
                    <Card.Text>{post.description}</Card.Text>
                    <Button
                      as={Link}
                      to={`/posts/${post.id}/`}
                      variant="primary"
                    >
                      View Details
                    </Button>

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
                        onClick={() => toggleComments(post)}
                      >
                        💬 {post.comments_count ?? post.comments.length}
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Comment section with swipe up */}
          <AnimatePresence>
            {selectedPost && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="comment-overlay"
                onClick={() => setSelectedPost(null)}
              >
                <div
                  className="comment-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="comment-close-btn"
                    onClick={() => setSelectedPost(null)}
                  >
                    ✖
                  </button>
                  <h5 className="text-center">💬 Comments</h5>

                  {/* Comment Input Field */}
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
                  <div className="comment-list">
                    {selectedPost.comments.length > 0 ? (
                      selectedPost?.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`comment ${
                            comment.is_owner ? "comment-own" : ""
                          }`}
                        >
                          <div className="comment-header">
                            <div className="comment-info">
                              <img
                                src={
                                  comment.author_image ||
                                  "https://res.cloudinary.com/daj7vkzdw/image/upload/v1737570810/default_profile_uehpos.jpg"
                                }
                                alt="Profile"
                                className="comment-avatar"
                              />
                              <div className="comment-meta">
                                <strong>{comment.author}</strong>
                                <p className="text-muted small">
                                  {formatDistanceToNow(
                                    new Date(comment.created_at),
                                    { addSuffix: true }
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* 3 Point Menu for own comments */}
                            {comment?.is_owner && (
                              <BsDropdown className="comment-options">
                                <BsDropdown.Toggle
                                  as="button"
                                  className="comment-options-btn"
                                >
                                  ⋮
                                </BsDropdown.Toggle>
                                <BsDropdown.Menu align="end">
                                  <BsDropdown.Item
                                    onClick={() => handleEditComment(comment)}
                                  >
                                    ✏️ Edit
                                  </BsDropdown.Item>
                                  <BsDropdown.Item
                                    onClick={() => {
                                      setCommentToDeleteId(comment.id);
                                      setShowDeleteCommentModal(true);
                                    }}
                                    className="text-danger"
                                  >
                                    🗑 Delete
                                  </BsDropdown.Item>
                                </BsDropdown.Menu>
                              </BsDropdown>
                            )}
                          </div>
                          <div className="comment-body">
                            <p className="comment-content">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted text-center">No comments yet.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                await axiosReq.delete(`posts/comments/${commentToDeleteId}/`);
                setSelectedPost((prev) => ({
                  ...prev,
                  comments: prev.comments.filter((c) => c.id !== commentToDeleteId),
                }));
                if (typeof setPosts === "function") {
                  setPosts((prevPosts) =>
                    prevPosts.map((p) =>
                      p.id === postId
                        ? {
                            ...p,
                            comments: p.comments.filter((c) => c.id !== commentToDeleteId),
                            comments_count: p.comments_count - 1,
                          }
                        : p
                    )
                  );
                }
                toast.success("✅ Comment deleted successfully!");
              } catch (err) {
                console.error("❌ Error deleting comment:", err);
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

export default Posts;
