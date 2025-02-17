import React from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import Posts from "./Posts";
import TopFollowedUsers from "../components/TopFollowedUsers";
import Dashboard from "./Dashboard";
import SittingRequests from "../components/SittingRequests";

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
          {/* Dashboard-Area */}
          <Dashboard />
          <Row className="mt-4">
            {/* Left Sidebar - Top Followed Users */}
            <Col lg={3} md={4} className="d-none d-md-block">
              <h5 className="mb-3">Top Followed Users</h5>
              <TopFollowedUsers />
            </Col>

            {/* Main Area - Posts */}
            <Col lg={6} md={8}>
              <Posts />
            </Col>

            {/* Right Sidebar - Sitting Requests */}
            <Col lg={3} md={4} className="d-none d-md-block">
              <h5 className="mb-3">Sitting Requests</h5>
              <SittingRequests />
            </Col>
          </Row>
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
