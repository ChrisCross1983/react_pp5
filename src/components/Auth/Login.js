import React, { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { axiosReq } from "../../api/axios";
import { Card, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const { setIsAuthenticated, setUserId, setUsername } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const verified = queryParams.get("verified");
    const expired = queryParams.get("expired");

    if (verified === "true") {
      setSuccessMessage("Your email has been verified successfully. You can now log in.");
    } else if (expired === "true") {
      setErrorMessage(<>This verification link has expired. Please <a href="/resend-email">click here to resend the confirmation email</a>.</>);
    }
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleLogin = async (username, password) => {
    try {
      const response = await axiosReq.post("auth/login/", { username, password });

      console.log("✅ Login Response:", response.data);

      if (response.data.access && response.data.refresh) {
        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        axiosReq.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;

        setIsAuthenticated(true);

        axiosReq.get("auth/user/")
          .then(response => {
            setUserId(response.data.pk);
            setUsername(response.data.username);
          })
          .catch(error => console.error("❌ Error fetching user info:", error.response?.data || error.message));

        navigate("/dashboard");
      } else {
        console.error("⚠️ No valid token in Backend-Response!");
      }
    } catch (error) {
      setErrorMessage("Invalid username or password. Please try again.");
      console.error("❌ Login failed:", error.response?.data || error.message);
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
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4">Login to Lucky Cat</Card.Title>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter your username"
                {...register("username", { required: "Username is required" })}
                isInvalid={!!errors.username}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter your password"
                {...register("password", { required: "Password is required" })}
                isInvalid={!!errors.password}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
