import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosReq } from "../../api/axios";
import { Card, Form, Button, Alert } from "react-bootstrap";

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const uidParam = params.get("uid");
    const tokenParam = params.get("token");

    if (uidParam && tokenParam) {
      setUid(uidParam);
      setToken(tokenParam);
    } else {
      setErrorMessage("❌ Invalid or expired reset link.");
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    if (password1 !== password2) {
      setErrorMessage("❌ Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      await axiosReq.post("/auth/password/reset/confirm/", {
        uid,
        token,
        new_password1: password1,
        new_password2: password2,
      });
      setSuccessMessage("✅ Your password has been reset. You can now log in.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.new_password2?.[0] ||
        err.response?.data?.detail ||
        "❌ Failed to reset password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card className="p-4 shadow-sm" style={{ maxWidth: "400px", width: "100%" }}>
        <Card.Body>
          <Card.Title className="mb-4 text-center">🔒 Reset Password</Card.Title>

          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          {!successMessage && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password1}
                  onChange={(e) => setPassword1(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Repeat New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
