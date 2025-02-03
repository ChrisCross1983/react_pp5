import React, { useState } from "react";
import { axiosReq } from "../../api/axios";
import { Card, Button, Form, Alert } from "react-bootstrap";

const ResendEmail = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axiosReq.post("/auth/registration/resend-email/", {
        email: email,
      });

      setMessage("✅ A new verification email has been sent. Please check your inbox!");
    } catch (err) {
      setError("❌ Error: Unable to resend the email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4">Resend Verification Email</Card.Title>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
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
