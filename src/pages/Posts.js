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
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { axiosReq } from "../api/axios";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        console.log("🔄 Fetching latest posts...");
        const response = await axiosReq.get("posts/feed/");
        let fetchedPosts = response.data?.results ?? response.data;

        if (!Array.isArray(fetchedPosts)) {
          console.warn("⚠️ Unexpected API response format:", response.data);
          fetchedPosts = [];
        }

        console.log(`✅ Posts fetched (${fetchedPosts.length}):`, fetchedPosts);
        setPosts(fetchedPosts);
      } catch (err) {
        console.error("❌ Failed to load posts:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (post) => {
    try {
      const updatedPosts = posts.map((p) =>
        p.id === post.id
          ? {
              ...p,
              has_liked: !p.has_liked,
              likes_count: p.has_liked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      );
      setPosts(updatedPosts);

      if (post.has_liked) {
        await axiosReq.delete(`posts/${post.id}/like/`);
      } else {
        await axiosReq.post(`posts/${post.id}/like/`);
      }
    } catch (err) {
      console.error("❌ Error liking post:", err);
    }
  };

  const toggleComments = (post) => {
    console.log("🟢 Comment button clicked for post:", post.id);

    if (selectedPost?.id === post.id) {
      setSelectedPost(null);
    } else {
      setSelectedPost(post);
      setNewComment("");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;

    try {
      const response = await axiosReq.post(
        `posts/${selectedPost.id}/comment/`,
        { content: newComment, post: selectedPost.id }
      );

      console.log("✅ New comment saved successfully:", response.data);

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === selectedPost.id
            ? { ...p, comments: [...p.comments, response.data] }
            : p
        )
      );

      setSelectedPost((prev) => ({
        ...prev,
        comments: [...prev.comments, response.data],
      }));

      setNewComment("");
    } catch (err) {
      console.error("❌ Error saving comment:", err);
    }
  };

  return (
    <Container className="mt-4">
      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && posts.length === 0 ? (
        <Alert variant="info">No posts found.</Alert>
      ) : (
        <Row className="justify-content-center">
          {posts.map((post) => (
            <Col md={8} key={post.id} className="mb-4">
              <Card className="shadow-sm">
                {/* Author Bar */}
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
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
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

                {/* Like & Comment Buttons */}
                <div className="post-actions">
                  <button
                    className={`like-button ${post.has_liked ? "active" : ""}`}
                    onClick={() => handleLike(post)}
                  >
                    {post.has_liked ? "❤️" : "🤍"} {post.likes_count}
                  </button>
                  <button
                    className="comment-button"
                    onClick={() => toggleComments(post)}
                  >
                    💬 {post.comments.length}
                  </button>
                </div>

                {/* Post Content */}
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Category: {post.category || "Unknown"}
                  </Card.Subtitle>
                  <Card.Text>{post.description}</Card.Text>
                  <Button as={Link} to={`/posts/${post.id}/`} variant="primary">
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

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
              <h5 className="text-center">{selectedPost.title} - Comments</h5>
              <div className="comment-list">
                {selectedPost.comments.length > 0 ? (
                  selectedPost.comments.map((comment, index) => (
                    <div key={index} className="comment">
                      <strong>{comment.author}</strong>: {comment.content}
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center">No comments yet.</p>
                )}
              </div>
              {/* Comment Field */}
              <Form className="comment-input" onSubmit={handleCommentSubmit}>
                <Form.Control
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                {newComment.trim() && (
                <Button type="submit" variant="primary" className="comment-submit-btn">
                  ➤
                </Button>
                )}
              </Form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Posts;
