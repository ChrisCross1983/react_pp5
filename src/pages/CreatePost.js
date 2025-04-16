import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { axiosReq } from "../api/axios";
import { toast } from "react-toastify";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const categoryMap = {
    offer: "offer",
    search: "search",
    general: "general",
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("❌ Title cannot be empty.");
      return;
    }
  
    if (!description.trim()) {
      toast.error("❌ Description is required!");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", categoryMap[category] || "general");

      if (image) {
        formData.append("image", image);
      }

      await axiosReq.post("posts/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("✅ Post created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(
        "❌ ERROR: Post cannot be created!",
        err.response?.data || err.message
      );
      setError("Post cannot be created. Please check your input");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      <h2>📝 Create Post</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Title */}
        {console.log("📌 Rendering Form Title Input...")}
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>

        {/* Description */}
        {console.log("📌 Rendering Form Description Input...")}
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Write something about your post..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        {/* Category Dropdown */}
        {console.log("📌 Debug: Rendering Category Select Component", category)}
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          {console.log("📌 Debug: Prüfe Form.Select", Form.Select)}
          <Form.Control
            as="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="offer">Sitting Offer</option>
            <option value="search">Sitting Request</option>
            <option value="general">General</option>
          </Form.Control>
        </Form.Group>

        {/* Image Upload */}
        {console.log("📌 Rendering Form Image Upload...")}
        <Form.Group className="mb-3">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </Form.Group>

        {/* Submit Button */}
        {console.log("📌 Rendering Form Submit Button...")}
        <Button type="submit" variant="primary" disabled={uploading}>
          {uploading ? "Uploading..." : "Create Post"}
        </Button>
      </Form>
    </Container>
  );
};

export default CreatePost;
