import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import axiosInstance from "../api/axios";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`/posts/${id}/`);
        setPost(response.data);
      } catch (err) {
        setError("Failed to load the post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  return (
    <div className="container mt-4">
      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {post && (
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>{post.title}</Card.Title>
            <Card.Text>{post.description}</Card.Text>
            <Button variant="secondary" href="/posts">
              Back to Posts
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default PostDetail;
