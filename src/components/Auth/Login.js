import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosInstance, { getCsrfToken } from "../../api/axios";
import { Card, Button, Form, Alert } from "react-bootstrap";

const Login = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCsrfToken();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log("Submitting data:", data);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await axiosInstance.post("/auth/login/", {
        email: data.email,
        password: data.password,
      });

      console.log("Response data:", response.data);
      alert("Login successful!");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.detail ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form onSubmit={handleSubmit(onSubmit)}>
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
