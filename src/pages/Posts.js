import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPosts = async (query = "") => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/posts/feed/?search=${query}`);
      setPosts(response.data.results);
      setError(null);
    } catch (err) {
      setError("Failed to load posts. Please try again later.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(searchQuery);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Recent Posts</h2>

      {/* 🔍 Search field */}
      <Form onSubmit={handleSearch} className="mb-3 d-flex">
        <Form.Control
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" variant="primary" className="ms-2">
          Search
        </Button>
      </Form>

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
    </div>
  );
};

export default Posts;
