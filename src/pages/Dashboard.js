import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import Posts from "./Posts";
import { axiosReq } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Offcanvas from "react-bootstrap/Offcanvas";
import SittingRequestsPage from "../pages/SittingRequestsPage";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardInsights from "../components/DashboardInsights";

const Dashboard = () => {
  const { username } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [userReady, setUserReady] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();


  // Set User ready
  useEffect(() => {
    if (username) {
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
    if (userReady) {
      fetchPosts();
    }
  }, [userReady]);
  
    const currentUser = username.toLowerCase();
  
    const fetchPosts = async () => {
      if (!userReady || !hasMore) return;
    
      const currentUser = username.toLowerCase();
    
      setLoading(true);
    
      try {
        const response = await axiosReq.get(`/posts/feed/?page=${page}`);
        const fetchedPosts = response.data?.results ?? [];
    
        const updatedPosts = fetchedPosts.map((post) => ({
          ...post,
          is_owner: post.author?.toLowerCase() === currentUser,
        }));
    
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filtered = updatedPosts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...filtered];
        });
        
        setHasMore(!!response.data.next);
        setPage((prev) => prev + 1);
      } catch (err) {
        console.error("❌ Failed to load posts:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };


  // Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
  
      if (nearBottom && !loading && hasMore) {
        fetchPosts();
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, userReady]);


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
        {/* Left Sidebar - Dashboard Insights */}
        <Col lg={3} className="d-none d-lg-block">
          <DashboardInsights />
        </Col>

        {/* Main Content - Posts Feed */}
        <Col lg={6}>
          <Posts
            posts={posts}
            setPosts={setPosts}
            loading={loading}
            error={error}
          />
        </Col>

        {/* Right Sidebar - Sitting Requests Overview */}
        <Col lg={3} className="d-none d-lg-block">
          <DashboardSidebar />
        </Col>

        {/* MOBILE Offcanvas */}
        <Col xs={12} className="d-block d-lg-none">
          {/* Fixed Buttons at the bottom */}
          <div className="d-flex justify-content-between fixed-bottom px-3 pb-3">
            <Button
              variant="outline-secondary"
              onClick={() => setShowLeft(true)}
              className="offcanvas-toggle-btn"
              style={{ borderRadius: "50%", width: "50px", height: "50px" }}
            >
              🔥
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setShowRight(true)}
              className="offcanvas-toggle-btn"
              style={{ borderRadius: "50%", width: "50px", height: "50px" }}
            >
              🐱
            </Button>
          </div>

          {/* Offcanvas - Left (DashboardInsights) */}
          <Offcanvas show={showLeft} onHide={() => setShowLeft(false)} placement="start">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>📌 Dashboard Insights</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <DashboardInsights />
            </Offcanvas.Body>
          </Offcanvas>

          {/* Offcanvas - Right (SittingRequests) */}
          <Offcanvas
            show={showRight}
            onHide={() => setShowRight(false)}
            placement="end"
            className="custom-offcanvas-narrow"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title as="h3" className="w-100 text-center">
                📬 My Cat-Sitting Inbox
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <div className="sitting-requests-inner-wrapper">
                <SittingRequestsPage />
              </div>
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
