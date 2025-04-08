import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import TopFollowedUsers from "../components/TopFollowedUsers";
import SittingRequests from "../components/SittingRequests";
import Posts from "./Posts";
import { axiosReq } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Offcanvas from "react-bootstrap/Offcanvas";


const Dashboard = () => {
  const { username } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [userReady, setUserReady] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // Set User ready
  useEffect(() => {
    if (username) {
      console.log("✅ userReady TRIGGERED:", username);
      setUserReady(true);
    }
  }, [username]);

  // Scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Post Fetching
  useEffect(() => {
    if (!userReady) {
      console.log("⏳ userReady is false, skip fetching posts.");
      return;
    }
  
    const currentUser = username.toLowerCase();
    console.log("🟢 Fetching posts for:", currentUser);
  
    const fetchPosts = async () => {
      console.log("📛 Token exists in fetch?", localStorage.getItem("accessToken"));
      setLoading(true);
      try {
        console.log("📤 Sending request to /posts/feed/ with token:", localStorage.getItem("accessToken"));
        axiosReq.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("accessToken")}`;

        const response = await axiosReq.get("/posts/feed/");
        console.log("📦 Full response from /posts/feed/:", response.data);
        const fetchedPosts = response.data?.results ?? [];

        console.log("📦 Raw fetchedPosts:", fetchedPosts);
  
        const updatedPosts = await Promise.all(
          fetchedPosts.map(async (post) => {
            try {
              const commentResponse = await axiosReq.get(
                `comments/?post=${post.id}`
              );
              return {
                ...post,
                is_owner: post.author?.toLowerCase() === currentUser,
                comments_count: commentResponse.data.count,
                comments: commentResponse.data.results.map((comment) => ({
                  ...comment,
                  is_owner:
                    comment.author?.toLowerCase?.() === currentUser,
                })),
              };
            } catch (err) {
              console.error(
                `❌ Error loading comments for post ${post.id}:`,
                err
              );
              return post;
            }
          })
        );

        console.log("🛠️ Processed updatedPosts:", updatedPosts);

        setPosts(updatedPosts);
        console.log("👀 Posts to render in state:", updatedPosts);
      } catch (err) {
        console.error("❌ Failed to load posts:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    setTimeout(() => {
      fetchPosts();
    }, 300);
  }, [userReady]);

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3">
        <Col className="text-center">
          <Button variant="success" onClick={() => navigate("/create-post")}>
            📝 Create New Post
          </Button>
        </Col>
      </Row>

      <Row>
        {/* Left Sidebar - Top Followed Users */}
        <Col md={3} className="d-none d-md-block">
          <Card className="mb-4 shadow-sm sidebar-card">
            <Card.Header className="bg-light fw-bold">🔥 Top Followed Users</Card.Header>
            <Card.Body>
              <TopFollowedUsers />
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content - Posts Feed */}
        <Col md={6}>
          <Posts
            posts={posts}
            setPosts={setPosts}
            loading={loading}
            error={error}
          />
        </Col>

        {/* Right Sidebar - Sitting Requests */}
        <Col md={3} className="d-none d-md-block">
          <Card className="mb-4 shadow-sm sidebar-card">
            <Card.Header className="bg-light fw-bold">🐾 Sitting Requests</Card.Header>
            <Card.Body>
              <SittingRequests />
            </Card.Body>
          </Card>
        </Col>

        {/* MOBILE Offcanvas */}
        <Col xs={12} className="d-block d-md-none">
          {/* Fixed Buttons at the bottom */}
          <div className="d-flex justify-content-between fixed-bottom px-3 pb-3">
            <Button
              variant="outline-secondary"
              onClick={() => setShowLeft(true)}
              style={{ borderRadius: "50%", width: "50px", height: "50px" }}
            >
              🔥
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setShowRight(true)}
              style={{ borderRadius: "50%", width: "50px", height: "50px" }}
            >
              🐾
            </Button>
          </div>

          {/* Offcanvas - Left (TopFollowedUsers) */}
          <Offcanvas show={showLeft} onHide={() => setShowLeft(false)} placement="start">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>🔥 Top Followed Users</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <TopFollowedUsers />
            </Offcanvas.Body>
          </Offcanvas>

          {/* Offcanvas - Right (SittingRequests) */}
          <Offcanvas show={showRight} onHide={() => setShowRight(false)} placement="end">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>🐾 Sitting Requests</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <SittingRequests />
            </Offcanvas.Body>
          </Offcanvas>
        </Col>
      </Row>

      {/* Scroll-to-Top Button */}
      {showScrollTop && (
        <Button
          className="scroll-btn"
          variant="dark"
          onClick={scrollToTop}
        >
          ⬆️
        </Button>
      )}
    </Container>
  );
};

export default Dashboard;
