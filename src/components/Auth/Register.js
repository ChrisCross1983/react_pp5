import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { axiosReq } from "../../api/axios";
import { Card, Button, Form, Alert, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const profilePicture = watch("profile_picture");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("password1", data.password);
      formData.append("password2", data.confirmPassword);
      if (data.profile_picture?.[0]) {
        formData.append("profile_picture", data.profile_picture[0]);
      }

      const response = await axiosReq.post("auth/registration/", formData);

      setSuccessMessage(
        "Registration successful! A verification email has been sent to your email address. Please check your inbox."
      );
      reset();
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error("❌ Registration failed:", error.response?.data || error.message);
      if (error.response?.data) {
        const errorMessages = Object.values(error.response.data).flat();
        setErrorMessage(errorMessages.join(" "));
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: "100%", maxWidth: "420px" }} className="profile-container p-1 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4">Register for Lucky Cat</Card.Title>

          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your first name"
                {...register("first_name", { required: "First name is required" })}
                isInvalid={!!errors.first_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.first_name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your last name"
                {...register("last_name", { required: "Last name is required" })}
                isInvalid={!!errors.last_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.last_name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your username"
                {...register("username", { required: "Username is required" })}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: "Email is required" })}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                {...register("password", { required: "Password is required" })}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword", { required: "Please confirm your password" })}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profile Picture (optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                {...register("profile_picture")}
                onChange={(e) =>
                  setPreview(e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null)
                }
              />
              {preview && (
                <div className="mt-2 text-center">
                  <Image
                    src={preview}
                    roundedCircle
                    width="100"
                    height="100"
                    alt="Preview"
                    className="border"
                  />
                </div>
              )}
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <small>Already have an account? <a href="/login">Login here</a></small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;
