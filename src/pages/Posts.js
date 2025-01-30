import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Form, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, category, sortOrder]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/posts/feed/", {
        params: {
          search: searchQuery,
          category: category || undefined,
          ordering: sortOrder === "newest" ? "-created_at" : "created_at",
        },
      });
      setPosts(response.data.results);
    } catch (err) {
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Recent Posts</h2>

      {/* 🔍 Search field, Category-filter & Sort options */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="catsitting">Cat Sitting</option>
            <option value="adoption">Adoption</option>
            <option value="general">General</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </Form.Select>
        </Col>
      </Row>

      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {posts.length === 0 && !loading ? (
        <Alert variant="info">No posts found.</Alert>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title>{post.title}</Card.Title>
              <Card.Text>{post.description}</Card.Text>
              <Button as={Link} to={`/posts/${post.id}`} variant="primary">
                View Details
              </Button>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Posts;
