import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { axiosReq, getCsrfToken } from "../../api/axios";
import { Card, Button, Form, Alert } from "react-bootstrap";

const Register = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    console.log("Submitting data:", data);
    setIsSubmitting(true);
    setErrorMessage(null);
  
    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) throw new Error("CSRF-Token konnte nicht abgerufen werden.");
  
      const response = await axiosReq.post("/auth/registration/", {
        username: data.username,
        email: data.email,
        password1: data.password,
        password2: data.confirmPassword,
      }, {
        headers: { "X-CSRFToken": csrfToken }
      });
  
      console.log("✅ Registration succesful:", response.data);
      alert("Registration successful!");
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.detail || "Hoops, something went wrong, please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4">Register for Lucky Cat</Card.Title>
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
                {...register("confirmPassword", { required: "Confirm your password" })}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword?.message}
              </Form.Control.Feedback>
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
