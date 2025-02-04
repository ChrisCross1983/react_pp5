import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { axiosReq, getCsrfToken } from "../../api/axios";
import { Card, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const verified = queryParams.get("verified");
    const expired = queryParams.get("expired");

    if (verified === "true") {
      setSuccessMessage(
        "Your email has been verified successfully. You can now log in."
      );
    } else if (expired === "true") {
      setErrorMessage(
        <>
          This verification link has expired. Please&nbsp;
          <a href="/resend-email">
            click here to resend the confirmation email
          </a>
          .
        </>
      );
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleLogin = async (username, password) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axiosReq.post(
        "/auth/login/",
        { username, password },
        { headers: { "X-CSRFToken": csrfToken } }
      );

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      const userRes = await axiosReq.get("/api/auth/user/", {
        headers: { Authorization: `Bearer ${response.data.access}` },
      });

      localStorage.setItem("userId", userRes.data.id);
      window.dispatchEvent(new Event("storage"));

      setSuccessMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("❌ Login-Fehler:", error.response?.data || error.message);

      if (error.response?.status === 400) {
        setErrorMessage("Incorrect username or password. Please try again.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    await handleLogin(data.username, data.password);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card
        style={{ width: "100%", maxWidth: "400px" }}
        className="p-4 shadow-sm"
      >
        <Card.Body>
          <Card.Title className="text-center mb-4">
            Login to Lucky Cat
          </Card.Title>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)}>
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

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <small>
              Don't have an account? <a href="/register">Register here</a>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
