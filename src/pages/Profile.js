import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosReq } from "../api/axios";
import {
  Button,
  Modal,
  Form,
  Tabs,
  Tab,
  Alert,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [kpis, setKpis] = useState({ comments: 0, likes: 0 });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Loading profile
        const profileRes = await axiosReq.get(`profiles/${id}/`);
        console.log("📦 Loaded profile:", profileRes.data);
        console.log("📷 profile_picture:", profileRes.data.profile_picture);
  
        setProfile(profileRes.data);
        setIsFollowing(profileRes.data.is_following);
        setFirstName(profileRes.data.first_name || "");
        setLastName(profileRes.data.last_name || "");
        setBio(profileRes.data.bio || "");
  
        // Loading post of profile
        const postsRes = await axiosReq.get(`posts/author-posts/?author=${id}&page_size=100`);
        console.log("🔎 postsRes.data:", postsRes.data);
        setPosts(postsRes.data.results || []);
        console.log("✅ Final posts (should be array):", postsRes.data.results);
  
        // Loading KPI-data for comments & likes
        const kpiRes = await axiosReq.get("/profiles/kpis/");
        console.log("📊 KPI-Response:", kpiRes.data);

        setKpis({
          comments: kpiRes.data.comments || 0,
          likes: kpiRes.data.likes || 0,
          requests_in: kpiRes.data.requests_in || 0,
          requests_out: kpiRes.data.requests_out || 0,
        });              

      } catch (err) {
        toast.error("❌ Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);


  const handleEditProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("bio", bio);
      if (image instanceof File) {
        formData.append("profile_picture", image);
      }

      const response = await axiosReq.patch("profiles/edit/", formData);

      setProfile(response.data);
      setFirstName(response.data.first_name || "");
      setLastName(response.data.last_name || "");
      setBio(response.data.bio || "");
      setImage(null);
      setShowEditModal(false);
      toast.success("✅ Profile updated!");
    } catch (err) {
      toast.error("❌ Update failed");
      console.error(err);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;

    try {
      await axiosReq.delete("profiles/delete/");
      toast.success("🗑️ Profile deleted");
      navigate("/");
    } catch (err) {
      toast.error("❌ Delete failed");
    }
  };

  const handleFollowToggle = async () => {
    try {
      await axiosReq.post(`profiles/${id}/follow/`);
      setIsFollowing((prev) => !prev);
    } catch (err) {
      toast.error("❌ Follow failed");
    }
  };

  if (!profile || loading) return <Spinner animation="border" className="mt-5" />;

  return (
    <div className="container profile-container p-4">
      <div className="profile-header d-flex gap-4">
        <div className="profile-picture-wrapper">
          <img
            src={
              profile?.profile_picture?.includes("http")
                ? `${profile.profile_picture}?${Date.now()}`
                : "/default-avatar.png"
            }
            onError={(e) => (e.target.src = "/default-avatar.png")}
            alt="Profile"
            className="profile-picture"
          />
        </div>
        <div className="profile-details">
          <h2 className="mb-1">
            {firstName || profile?.first_name || "No Name"}
            {" "}
            {lastName || profile?.last_name || ""}
          </h2>
          <p className="profile-bio mb-3">{bio || profile?.bio || "No bio yet."}</p>
          <div className="profile-stats d-flex flex-wrap gap-3 mb-3">
            <div><strong>Posts</strong><br />{posts.length}</div>
            <div><strong>Followers</strong><br />{profile.followers_count}</div>
            <div><strong>Following</strong><br />{profile.following_count}</div>
            <div><strong>Received Likes</strong><br />{kpis.likes}</div>
            <div><strong>Received Comments</strong><br />{kpis.comments}</div>
            <div><strong>Requests</strong><br />In: {kpis.requests_in ?? 0} / Out: {kpis.requests_out ?? 0}</div>
          </div>

          {profile.is_owner ? (
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={() => setShowEditModal(true)}>✏️ Edit</Button>
              <Button variant="outline-danger" onClick={handleDeleteProfile}>🗑️ Delete</Button>
            </div>
          ) : (
            <Button
              variant={isFollowing ? "outline-danger" : "outline-success"}
              onClick={handleFollowToggle}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultActiveKey="posts" className="mt-5">
        <Tab eventKey="posts" title="📸 Posts">
          <div className="post-grid mt-4">
            {posts.length === 0 ? (
              <Alert variant="info">No posts yet.</Alert>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="post-thumbnail"
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  <img src={post.image || "/default_post.jpg"} alt={post.title} />
                </div>
              ))
            )}
          </div>
        </Tab>

        <Tab eventKey="follow-requests" title="🔁 Follow Requests">
          <Alert variant="info" className="mt-4">Follow request handling will go here.</Alert>
        </Tab>

        <Tab eventKey="activity" title="🧾 Activity">
          <Alert variant="info" className="mt-4">Activity log like likes/comments/sittings here.</Alert>
        </Tab>
      </Tabs>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>First Name</Form.Label>
              <Form.Control value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Last Name</Form.Label>
              <Form.Control value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Bio</Form.Label>
              <Form.Control as="textarea" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleEditProfile}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
