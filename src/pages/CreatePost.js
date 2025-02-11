import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { axiosReq } from "../api/axios";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🚀 STATE CHANGE DETECTED: uploading =", uploading);
  }, [uploading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🟢 handleSubmit was called!");
    setUploading(true);

    setTimeout(() => {
      console.log("🔄 CHECK: Uploading should be true ->", uploading);
    }, 500);

    setError(null);

    if (!description.trim()) {
      setError("❌ Description shouldnt be empty!");
      setUploading(false);
      return;
    }

    console.log("📤 handleSubmit started!");
    console.log("✅ Test point 1: Code reaches try block!");

    try {
      console.log("🟡 Test Point 2: Reached axiosReq.post!");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      if (image) {
        formData.append("image", image);
      }

      console.log("📤 Sende FormData:", Object.fromEntries(formData.entries()));

      const response = await axiosReq.post("posts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Post succesfully created:", response.data);

      window.location.reload();
    } catch (err) {
      console.error(
        "❌ Error in handleSubmit:",
        err.response?.data || err.message
      );
      console.log("🔎 Error details:", err.response);
      setError(err.response?.data || "Error while creating post.");
    } finally {
      console.log("🔄 Set uploading to false! (Check if this runs)");
      setUploading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>✅ CreatePost mit useState</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" disabled={uploading}>
          {uploading ? <Spinner animation="border" size="sm" /> : "Submit"}
        </Button>
      </Form>
    </Container>
  );
};

export default CreatePost;
