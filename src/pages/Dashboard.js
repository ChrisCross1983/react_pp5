import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Posts from "./Posts";
import TopFollowedUsers from "../components/TopFollowedUsers";
import SittingRequests from "../components/SittingRequests";

const Dashboard = () => {
  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Left Sidebar - Top Followed Users */}
        <Col md={3} className="d-none d-md-block">
          <h3>🔥 Top Followed Users</h3>
          <TopFollowedUsers />
        </Col>

        {/* Main Content - Posts Feed */}
        <Col md={6}>
          <Posts />
        </Col>

        {/* Right Sidebar - Sitting Requests */}
        <Col md={3} className="d-none d-md-block">
          <h3>🐾 Sitting Requests</h3>
          <SittingRequests />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
