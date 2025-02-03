import React, { useState } from "react";
import { axiosReq, getCsrfToken } from "../../api/axios";
import { Card, Button, Form, Alert } from "react-bootstrap";

const ResendEmail = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) throw new Error("CSRF-Token cannot be retrieved.");

      await axiosReq.post(
        "/auth/registration/resend-email/",
        { email },
        { headers: { "X-CSRFToken": csrfToken } }
      );

      setMessage("A new verification email has been sent to your email address. Please check your inbox.");
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4">
            Resend Verification Email
          </Card.Title>
          {message && <Alert variant="success">{message}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Resend Email"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResendEmail;
