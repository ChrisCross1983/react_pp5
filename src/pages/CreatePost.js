import React, { useState } from "react";
import { Card, Container, Form, Button, Alert, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { axiosReq } from "../api/axios";
import { toast } from "react-toastify";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const categoryMap = {
    offer: "offer",
    search: "search",
    general: "general",
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
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
      console.error("❌ Post creation failed", err.response?.data || err.message);
      setError("Post cannot be created. Please check your input");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-90 bg-light">
      <Card style={{ width: "100%", maxWidth: "480px" }} className="profile-container p-1 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4">📝 Create New Post</Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

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

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
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

            <Form.Group className="mb-3">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {preview && (
                <div className="mt-2 text-center">
                  <Image
                    src={preview}
                    alt="Preview"
                    rounded
                    fluid
                    style={{ maxHeight: "200px", border: "1px solid #ccc" }}
                  />
                </div>
              )}
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Create Post"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <small>
              Not ready yet? <a href="/dashboard">Go back to Dashboard</a>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreatePost;
