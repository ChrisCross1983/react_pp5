import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { axiosReq } from "../api/axios";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching latest posts...");
      const response = await axiosReq.get("posts/feed/");
      console.log("✅ API Response:", response.data);

      if (Array.isArray(response.data.results)) {
        console.log("✅ API contains 'results' array!");
        setPosts(response.data.results);
      } else if (Array.isArray(response.data)) {
        console.warn("⚠️ API returned array directly, using response.data.");
        setPosts(response.data);
      } else {
        console.error("❌ API format unexpected:", response.data);
        setError("Unexpected API response format.");
      }
    } catch (err) {
      console.error(
        "❌ Error fetching posts:",
        err.response?.data || err.message
      );
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Recent Posts</h2>

      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && posts.length === 0 ? (
        <Alert variant="info">No posts found.</Alert>
      ) : (
        <Row>
          {posts.map((post) => (
            <Col md={6} lg={4} key={post.id}>
              <Card className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
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
    </Container>
  );
};

export default Posts;
