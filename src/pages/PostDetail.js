import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spinner, Alert, Form, Modal } from "react-bootstrap";
import { axiosReq } from "../api/axios";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axiosReq.get(`posts/${id}/`);
      setPost(response.data);
    } catch (err) {
      setError("Failed to load the post. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axiosReq.get(`posts/${id}/comment/`);
      setComments(response.data);
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  };

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await axiosReq.post(
        `posts/${id}/like/`,
        {},
        { headers: { "X-CSRFToken": localStorage.getItem("csrfToken") } }
      );
      setPost((prevPost) => ({
        ...prevPost,
        likes_count: prevPost.likes_count + 1,
      }));
    } catch (err) {
      console.error("Failed to like the post", err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeletePost = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;

    try {
      await axiosReq.delete(`posts/${id}/`, {
        headers: { "X-CSRFToken": localStorage.getItem("csrfToken") },
      });
      alert("Post deleted successfully.");
      navigate("/");
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleEditPost = async () => {
    try {
      const response = await axiosReq.put(
        `posts/${id}/`,
        { description: editContent },
        { headers: { "X-CSRFToken": localStorage.getItem("csrfToken") } }
      );
      setPost(response.data);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error editing post:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axiosReq.post(
        `posts/${id}/comments/`,
        { content: newComment },
        { headers: { "X-CSRFToken": localStorage.getItem("csrfToken") } }
      );

      setComments([...comments, response.data]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmDelete) return;

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
    <div className="container mt-4">
      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {post && (
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>{post.title}</Card.Title>
            <Card.Text>{post.description}</Card.Text>
            <div className="d-flex align-items-center">
              <Button
                variant="outline-primary"
                onClick={handleLike}
                disabled={isLiking}
              >
                ❤️ Like {post.likes_count}
              </Button>

              {post.is_owner && (
                <>
                  <Button
                    variant="outline-warning"
                    className="ms-2"
                    onClick={() => {
                      setEditContent(post.description);
                      setShowEditModal(true);
                    }}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="ms-2"
                    onClick={handleDeletePost}
                  >
                    🗑 Delete
                  </Button>
                </>
              )}
            </div>

            <hr />

            <h5>Comments</h5>
            {comments.length === 0 ? (
              <p>No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="mb-2">
                  <Card.Body>
                    <strong>{comment.author}</strong>: {comment.content}
                    {comment.is_owner && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        🗑 Delete
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              ))
            )}

            <Form onSubmit={handleCommentSubmit} className="mt-3">
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" className="mt-2" variant="primary">
                Post Comment
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Edit Post Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
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
    </div>
  );
};

export default PostDetail;
