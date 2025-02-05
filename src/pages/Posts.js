import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { axiosReq } from "../api/axios";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Dummy-Posts for testing
  const dummyPosts = [
    { id: 1, title: "Need a Cat-Sitter in Berlin", description: "Looking for a sitter for my 2 cats next weekend!" },
    { id: 2, title: "Offering Cat-Sitting in Munich", description: "Happy to take care of your cat while you're away!" },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axiosReq.get("posts/feed/");
        setPosts(response.data.results?.length ? response.data.results : dummyPosts);
      } catch (err) {
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

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
