import React from "react";
import { Container, Row, Col, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Posts from "./Posts";
import TopFollowedUsers from "../components/TopFollowedUsers";

const Home = () => {
  const accessToken = localStorage.getItem("accessToken");
  const isLoggedIn = !!accessToken;

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Welcome to Lucky Cat</h2>
      <p className="text-center">Your platform for cat-sitting requests and offers.</p>

      {!isLoggedIn ? (
        <Alert variant="warning" className="text-center">
          Please <Link to="/login">log in</Link> to view posts.
        </Alert>
      ) : (
        <>
          {/* 🔹 Dashboard for logged in Users */}
          <Row className="mb-4">
            <Col className="text-center">
              <h4>Dashboard</h4>
              <p>Welcome back! Check out the latest posts and popular users.</p>
              <Button as={Link} to="/profile" variant="info" className="me-2">
                Go to Profile
              </Button>
              <Button as={Link} to="/create-post" variant="primary">
                Create Post
              </Button>
            </Col>
          </Row>

          <Row>
            {/* Post Feed */}
            <Col md={8}>
              <h4>Latest Posts</h4>
              <Posts /> {/* ✅ Component for Posts */}
            </Col>

            {/* Sidebar with Top-Followed-Users */}
            <Col md={4}>
              <h4>Top Followed Users</h4>
              <TopFollowedUsers />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Home;
