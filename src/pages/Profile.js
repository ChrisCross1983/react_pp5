import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { axiosReq } from "../api/axios";
import {
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  Modal,
  ListGroup,
  Tabs,
  Tab,
} from "react-bootstrap";
import SittingRequestsPage from "../pages/SittingRequestsPage";

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bio, setBio] = useState("");
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState(0);
  const [sentRequests, setSentRequests] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosReq.get(`profiles/${id}/`);
        setProfile(response.data);
        setBio(response.data.bio);
        setIsFollowing(response.data.is_following);
        setFollowersCount(response.data.followers_count);
      } catch (err) {
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await axiosReq.get(`posts/?author=${id}`);
        setPosts(response.data);
      } catch (err) {
        console.error("Error loading posts:", err);
    }
    };

    const fetchSittingRequests = async () => {
      try {
        const receivedRes = await axiosReq.get("posts/requests/incoming/");
        const sentRes = await axiosReq.get("posts/requests/sent/");
        setReceivedRequests(receivedRes.data.length);
        setSentRequests(sentRes.data.length);
      } catch (err) {
        console.error("Error fetching sitting requests:", err);
      }
    };

    fetchProfile();
    fetchPosts();
    fetchSittingRequests();
  }, [id]);

  const handleFollowToggle = async () => {
    try {
      await axiosReq.post(`profiles/${id}/follow/`);
      setIsFollowing(!isFollowing);
      setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("Failed to follow/unfollow user", err);
    }
  };

  const handleEditProfile = async () => {
    try {
      const response = await axiosReq.put(`profiles/edit/`, {
        bio: bio,
      });
      setProfile(response.data);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await axiosReq.get(`profiles/${id}/followers/`);
      setFollowers(response.data);
      setShowFollowersModal(true);
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await axiosReq.get(`profiles/${id}/following/`);
      setFollowing(response.data);
      setShowFollowingModal(true);
    } catch (err) {
      console.error("Error fetching following:", err);
    }
  };

  return (
    <div className="container mt-4">
      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {profile && (
        <Card className="shadow-sm">
          <Card.Body className="text-center">
            <img
              src={profile.profile_picture || "/default-avatar.png"}
              alt="Profile"
              className="rounded-circle mb-3"
              width="100"
              height="100"
            />
            <h3>{profile.username}</h3>
            <p>{profile.bio}</p>
            <div>
              <Button variant="link" onClick={fetchFollowers}>
                Followers: {followersCount}
              </Button>
              <Button variant="link" onClick={fetchFollowing}>
                Following: {profile.following_count}
              </Button>
              <p>
                <strong>Sitting Requests:</strong> Received: {receivedRequests} | Sent: {sentRequests}
              </p>
            </div>

            {profile.is_owner ? (
              <Button
                variant="outline-primary"
                onClick={() => setShowEditModal(true)}
              >
                ✏️ Edit Profile
                </Button>
            ) : (
              <Button
                variant={isFollowing ? "outline-danger" : "outline-success"}
                onClick={handleFollowToggle}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </Card.Body>
        </Card>
      )}

      {/* 🆕 Tabs for Posts, Followers and Sitting Requests */}
      <Tabs defaultActiveKey="posts" className="mt-4">
        <Tab eventKey="posts" title="User Posts">
          <h4 className="mt-4">User Posts</h4>
          {posts.length === 0 ? (
            <Alert variant="info">This user has no posts yet.</Alert>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>{post.description}</Card.Text>
                  <Button variant="primary" href={`/posts/${post.id}`}>
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            ))
          )}
        </Tab>

        <Tab eventKey="followers" title="Followers">
          {followers.length === 0 ? (
            <Alert variant="info">No followers yet.</Alert>
          ) : (
            <ListGroup>
              {followers.map((user) => (
                <ListGroup.Item key={user.id}>{user.username}</ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>

        <Tab eventKey="sitting-requests" title="Sitting Requests">
          <SittingRequestsPage />
        </Tab>
      </Tabs>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Followers Modal */}
      <Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Followers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {followers.map((user) => (
              <ListGroup.Item key={user.id}>{user.username}</ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFollowersModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Following Modal */}
      <Modal show={showFollowingModal} onHide={() => setShowFollowingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Following</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {following.map((user) => (
              <ListGroup.Item key={user.id}>{user.username}</ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFollowingModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
