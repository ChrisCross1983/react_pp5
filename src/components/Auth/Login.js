import React, { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { axiosReq } from "../../api/axios";
import { Card, Button, Form, Alert, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState(null);
  const [resetError, setResetError] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
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

      if (response.data.access && response.data.refresh) {
        login(response.data.access, response.data.refresh);

        navigate("/dashboard");
      } else {
        console.error("⚠️ No valid token in Backend-Response!");
      }
    } catch (error) {
      setErrorMessage("Invalid username or password. Please try again.");
      console.error("❌ Login failed:", error.response?.data || error.message);
      setIsSubmitting(false);
    }
  };


  const handlePasswordReset = async () => {
    setIsResetting(true);
    setResetMessage(null);
    setResetError(null);
  
    try {
      await axiosReq.post("auth/password/reset/", { email: resetEmail });
      setResetMessage("✅ If an account exists with that email, a reset link has been sent.");
      setResetEmail("");
    } catch (err) {
      setResetError("❌ Failed to send reset email. Please try again.");
      console.error(err.response?.data || err.message);
    } finally {
      setIsResetting(false);
    }
  };


  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    await handleLogin(data.username, data.password);
  };

  return (
    <>
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
              <div className="text-center mt-3">
                <Button variant="link" onClick={() => setShowResetModal(true)} style={{ fontSize: "0.9rem" }}>
                  Forgot password?
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>

      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resetMessage && <Alert variant="success">{resetMessage}</Alert>}
          {resetError && <Alert variant="danger">{resetError}</Alert>}

          <Form>
            <Form.Group>
              <Form.Label>Enter your email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePasswordReset} disabled={isResetting || !resetEmail}>
            {isResetting ? "Sending..." : "Send Reset Link"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Login;
