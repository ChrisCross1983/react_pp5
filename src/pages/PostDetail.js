import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spinner, Alert, Form, Modal } from "react-bootstrap";
import { axiosReq } from "../api/axios";

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchPost();
      await fetchComments();
      setLoading(false);
    };
  
    fetchData();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await axiosReq.get(`posts/${postId}/`);
      setPost({
        ...response.data,
        is_owner: response.data.is_owner ?? false,
      });
    } catch (err) {
      setError("Failed to load the post. Please try again later.");
    }
  };

  const fetchComments = async () => {
    try {
      let allComments = [];
      let nextPage = `posts/${postId}/comments/`;
  
      while (nextPage) {
        const response = await axiosReq.get(nextPage);
        console.log("🔄 Loaded comments:", response.data);
  
        allComments = [...allComments, ...response.data.results];
        nextPage = response.data.next;
      }
      setComments(allComments);
    } catch (err) {
      console.error("❌ Error while loading comments:", err.response?.data || err.message);
    }
  };

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

  const handleEditPost = async () => {
    try {
      const response = await axiosReq.put(
        `posts/${postId}/`,
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
        `posts/${postId}/comment/`,
        { content: newComment, post: postId },
        { headers: { "X-CSRFToken": localStorage.getItem("csrfToken") } }
      );

      console.log("✅ New comment saved succesfully:", response.data);
      setComments((prevComments) => [response.data, ...prevComments]);
      setNewComment("");
    } catch (err) {
      console.error("❌ Error while saving comment:", err.response?.data || err.message);
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

              {post?.is_owner && (
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

            {/* Comment textfield */}
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

            {/* Comment View */}
            {comments.length === 0 ? (
              <p className="mt-3">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="mb-2">
                  <Card.Body>
                    <strong>{comment.author}</strong>: {comment.content}
                    {comment.is_owner && (
                      <>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="ms-2"
                          onClick={() => handleEditComment(comment)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-2"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          🗑 Delete
                        </Button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              ))
            )}
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
      </div>
    );
  };

export default PostDetail;
