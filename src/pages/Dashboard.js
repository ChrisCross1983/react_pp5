import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import Posts from "./Posts";
import TopFollowedUsers from "../components/TopFollowedUsers";
import SittingRequests from "../components/SittingRequests";
import { axiosReq } from "../api/axios";

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("username")?.toLowerCase()
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll-to-Top
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

  // Fetching Posts
  useEffect(() => {
    if (!currentUser) {
      console.warn("⏳ Waiting for currentUser to be set...");
      return;
    }

    console.log("🟢 useEffect in Dashboard.js TRIGGERED – Fetching Posts...");
    const fetchPosts = async () => {
      setLoading(true);
      try {
        console.log("🔄 Fetching latest posts...");
        const response = await axiosReq.get("posts/feed/");
        let fetchedPosts = response.data?.results ?? response.data;

        if (!Array.isArray(fetchedPosts)) fetchedPosts = [];

        const updatedPosts = await Promise.all(
          fetchedPosts.map(async (post) => {
            try {
              const commentResponse = await axiosReq.get(
                `posts/${post.id}/comments/?limit=1000`
              );

              return {
                ...post,
                is_owner: post.author.toLowerCase() === currentUser,
                comments_count: commentResponse.data.count,
                comments: commentResponse.data.results.map((comment) => ({
                  ...comment,
                  is_owner: comment.author.toLowerCase() === currentUser,
                })),
              };
            } catch (err) {
              console.error(
                `❌ Error while loading comments for post ${post.id}:`,
                err
              );
              return post;
            }
          })
        );

        console.log(`✅ Posts fetched (${updatedPosts.length}):`, updatedPosts);
        setPosts(updatedPosts);
      } catch (err) {
        console.error("❌ Failed to load posts:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser]);

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
          <h3>🔥 Top Followed Users</h3>
          <TopFollowedUsers />
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
          <h3>🐾 Sitting Requests</h3>
          <SittingRequests />
        </Col>
      </Row>

      {/* Scroll-to-Top Button */}
      {showScrollTop && (
        <Button
          variant="dark"
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            borderRadius: "50%",
            padding: "10px 15px",
            fontSize: "20px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          ⬆️
        </Button>
      )}
    </Container>
  );
};

export default Dashboard;
