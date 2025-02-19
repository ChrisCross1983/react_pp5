import React from "react";
import { Container, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import Dashboard from "./Dashboard";

const Home = () => {
  const accessToken = localStorage.getItem("accessToken");
  const isLoggedIn = !!accessToken;

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Welcome to Lucky Cat</h2>
      <p className="text-center">
        Your platform for cat-sitting requests and offers.
      </p>

      {isLoggedIn ? (
        <>
          <Dashboard />
        </>
      ) : (
        <Alert variant="warning" className="text-center">
          Please <Link to="/login">log in</Link> to view posts.
        </Alert>
      )}
    </Container>
  );
};

export default Home;
