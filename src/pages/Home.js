import React, { useEffect, useState } from "react";
import { Card, Button, Spinner, Alert, Container } from "react-bootstrap";
import axiosInstance from "../api/axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [isLoggedIn]);

  const fetchPosts = async () => {
    try {
      const response = await axiosInstance.get("/posts/feed/");
      setPosts(response.data.results);
    } catch (err) {
      setError("Error loading posts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Welcome to Lucky Cat</h2>
      <p className="text-center">
        Your platform for cat-sitting requests and offers.
      </p>

      {!isLoggedIn ? (
        <Alert variant="warning" className="text-center">
          Please <Link to="/login">log in</Link> to view posts.
        </Alert>
      ) : (
        <>
          <div className="d-flex justify-content-between mb-3">
            <h4>Latest Posts</h4>
            <Button as={Link} to="/posts/new" variant="primary">
              Create New Post
            </Button>
          </div>

          {loading ? (
            <Spinner animation="border" />
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : posts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="mb-3">
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>{post.description}</Card.Text>
                  <Button as={Link} to={`/posts/${post.id}`} variant="outline-primary">
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            ))
          )}
        </>
      )}
    </Container>
  );
};

export default Home;
