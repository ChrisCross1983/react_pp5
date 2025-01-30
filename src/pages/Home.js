import React from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import Posts from "./Posts";
import TopFollowedUsers from "../components/TopFollowedUsers";

const Home = () => {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Welcome to Lucky Cat</h2>
      <p className="text-center">
        Your platform for cat-sitting requests and offers.
      </p>

      {!isLoggedIn ? (
        <Alert variant="warning" className="text-center">
          Please <Link to="/login">log in</Link> to view posts.
        </Alert>
      ) : (
        <Row>
          {/* Post Feed */}
          <Col md={8}>
            <h4>Latest Posts</h4>
            <Posts /> {/* ✅ Component for Posts */}
          </Col>

          {/* Sidebar with Top-Followed-Users */}
          <Col md={4}>
            <TopFollowedUsers />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Home;
