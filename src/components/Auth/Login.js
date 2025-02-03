import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { axiosReq } from "../../api/axios";
import { Card, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
      const response = await axiosReq.post("/auth/login/", {
        username: data.username,
        password: data.password,
      });

      console.log("✅ Login successful:", response.data);
      localStorage.setItem("accessToken", response.data.key);
      
      window.dispatchEvent(new Event("storage"));

      alert("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      
      if (error.response?.data?.non_field_errors?.includes("Email address is not verified.")) {
        setErrorMessage("Your email address is not verified. Please check your inbox or request a new confirmation email.");
      } else {
        setErrorMessage(
          error.response?.data?.detail || "Something went wrong. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4">
            Login to Lucky Cat
          </Card.Title>
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

            <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
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
