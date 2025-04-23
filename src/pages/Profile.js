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
import { Dropdown } from "bootstrap";
import { useSearchParams } from "react-router-dom";

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
  const [followRequests, setFollowRequests] = useState({ sent: [], received: [] });
  const [followRequestStatus, setFollowRequestStatus] = useState(null);
  const [followRequestId, setFollowRequestId] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [searchParams] = useSearchParams();
  const [isRequestReceiver, setIsRequestReceiver] = useState(false);
  const defaultTab = searchParams.get("tab") || "posts";
  const fetchData = async () => {
    try {
      // Loading profile
      const profileRes = await axiosReq.get(`profiles/${id}/`);
      console.log("📦 Loaded profile:", profileRes.data);

      setProfile(profileRes.data);
      setIsFollowing(profileRes.data.is_following);
      setFirstName(profileRes.data.first_name || "");
      setLastName(profileRes.data.last_name || "");
      setBio(profileRes.data.bio || "");

      const followersRes = await axiosReq.get(`/profiles/${id}/followers/`);
      setFollowers(Array.isArray(followersRes.data) ? followersRes.data : []);

      const followingRes = await axiosReq.get(`/profiles/${id}/following/`);
      setFollowing(Array.isArray(followingRes.data) ? followingRes.data : []);

      // Loading user posts
      const postsRes = await axiosReq.get(`posts/author-posts/?author=${id}&page_size=100`);
      setPosts(postsRes.data.results || []);

      // Loading KPI-Data (Likes, Comments, Sitting Requests)
      const kpiRes = await axiosReq.get("/profiles/kpis/");
      setKpis({
        comments: kpiRes.data.comments || 0,
        likes: kpiRes.data.likes || 0,
        requests_in: kpiRes.data.requests_in || 0,
        requests_out: kpiRes.data.requests_out || 0,
      });

      // Fetching follow-request-status
      const followRes = await axiosReq.get("/profiles/follow-requests/");
      const sent = followRes.data.sent.find(r => r.to === profileRes.data.owner);
      const received = followRes.data.received.find(r => r.from === profileRes.data.owner);

      let status = "none";
      if (sent) status = "sent";
      else if (received) status = "received";
      else if (profileRes.data.is_following) status = "accepted";

      setFollowRequestStatus(status);
      setFollowRequestId(sent?.id || received?.id || null);
      setIsRequestReceiver(!!received);

    } catch (err) {
      toast.error("❌ Failed to load profile");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [id]);


  useEffect(() => {
    const fetchFollowRequests = async () => {
      try {
        const res = await axiosReq.get("/profiles/follow-requests/");
        setFollowRequests({
          sent: res.data?.sent || [],
          received: res.data?.received || [],
        });
      } catch (err) {
        toast.error("❌ Failed to load follow requests");
      }
    };    

    if (profile?.is_owner) {
      fetchFollowRequests();
    }
  }, [profile]);


  useEffect(() => {
    console.log("📩 Status:", followRequestStatus, "| Receiver?", isRequestReceiver);
  }, [followRequestStatus, isRequestReceiver]);


  useEffect(() => {
    const dropdownEl = document.querySelector('[data-bs-toggle="dropdown"]');
    if (dropdownEl) {
      new Dropdown(dropdownEl);
    }
  }, [profile]);


  const sendFollowRequest = async () => {
    try {
      await axiosReq.post(`/profiles/follow-requests/send/${id}/`);
      setFollowRequestStatus("sent");
      toast.success("✅ Request sent");
    } catch (err) {
      toast.error("❌ Failed to send request");
    }
  };


  const cancelFollowRequest = async (requestId) => {
    try {
      await axiosReq.delete(`/profiles/follow-requests/cancel/${requestId}/`);
      toast.success("🗑️ Request canceled");
      setFollowRequests((prev) => ({
        ...prev,
        sent: prev.sent.filter((r) => r.id !== requestId),
      }));
    } catch (err) {
      toast.error("❌ Failed to cancel request");
    }
  };


  const acceptFollowRequest = async () => {
    try {
      await axiosReq.post(`/profiles/follow-requests/manage/${followRequestId}/`, { action: "accept" });
      setFollowRequestStatus("accepted");
      toast.success("✅ Request accepted");
    } catch (err) {
      toast.error("❌ Failed to accept");
    }
  };


  const declineFollowRequest = async () => {
    try {
      await axiosReq.post(`/profiles/follow-requests/manage/${followRequestId}/`, { action: "decline" });
      setFollowRequestStatus("none");
      setFollowRequestId(null);
      toast.success("❌ Request declined");
    } catch (err) {
      toast.error("❌ Failed to decline");
    }
  };


  const acceptFollowRequestManually = async (requestId) => {
    try {
      await axiosReq.post(`/profiles/follow-requests/manage/${requestId}/`, { action: "accept" });
      toast.success("✅ Request accepted");

      setFollowRequests((prev) => ({
        ...prev,
        received: prev.received.filter((r) => r.id !== requestId),
      }));

      const kpiRes = await axiosReq.get("/profiles/kpis/");
      setKpis({
        comments: kpiRes.data.comments || 0,
        likes: kpiRes.data.likes || 0,
        requests_in: kpiRes.data.requests_in || 0,
        requests_out: kpiRes.data.requests_out || 0,
      });

      fetchData();

    } catch (err) {
      toast.error("❌ Failed to accept request");
    }
  };


  const declineFollowRequestManually = async (requestId) => {
    try {
      await axiosReq.post(`/profiles/follow-requests/manage/${requestId}/`, { action: "decline" });
      toast.success("❌ Request declined");

      setFollowRequests((prev) => ({
        ...prev,
        received: prev.received.filter((r) => r.id !== requestId),
      }));
    } catch (err) {
      toast.error("❌ Failed to decline request");
    }
  };


  const unfollow = async () => {
    try {
      await axiosReq.delete(`/profiles/unfollow/${id}/`);
      setFollowRequestStatus("none");
      toast.success("🧺 Unfollowed");
    } catch (err) {
      toast.error("❌ Failed to unfollow");
    }
  };


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
    <div className="container profile-container py-4">
      <div className="profile-header d-flex flex-wrap justify-content-center gap-4">
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
  
        {/* Details + Actions */}
        <div className="flex-grow-1 position-relative">
          <div className="d-flex gap-4 align-items-start flex-wrap profile-info">
            <div>
              <h2 className="mb-1">
                {firstName || profile?.first_name || "No Name"}{" "}
                {lastName || profile?.last_name || ""}
                {profile?.follows_you && (
                  <span className="badge bg-info text-dark small ms-2">Follows you</span>
                )}
              </h2>
              <p className="profile-bio">{bio || "No bio yet."}</p>
            </div>

            {profile.is_owner && (
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  ⋮
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setShowEditModal(true)}
                    >
                      ✏️ Edit
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleDeleteProfile}
                    >
                      🗑️ Delete
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
    
          {/* Follow Action Buttons */}
          {profile && !profile.is_owner && (
            <div className="follow-button-wrapper">
              {followRequestStatus === "none" && (
                <Button variant="success" onClick={sendFollowRequest} className="mt-2 request-follow-btn">
                  ➕ Request to Follow
                </Button>
              )}
              {(followRequestStatus === "sent" || followRequestStatus === "received") && (
                <Button variant="secondary" className="mt-2" disabled>
                  ⏳ Pending
                </Button>
              )}
              {followRequestStatus === "accepted" && (
                <Button variant="outline-danger" className="mt-2" onClick={unfollow}>
                  Unfollow
                </Button>
              )}
            </div>
          )}

          {/* KPIs */}
          <div className="profile-stats d-flex flex-wrap gap-4 mt-4">
            <div><strong>Posts</strong><br />{posts.length}</div>
            <div><strong>Followers</strong><br />{profile.followers_count}</div>
            <div><strong>Following</strong><br />{profile.following_count}</div>
            <div><strong>Received Likes</strong><br />{kpis.likes}</div>
            <div><strong>Received Comments</strong><br />{kpis.comments}</div>
            <div><strong>Requests</strong><br />In: {kpis.requests_in ?? 0} / Out: {kpis.requests_out ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Tabs with posts */}
      {(profile.is_owner || followRequestStatus === "accepted") && (
      <div className="mt-5">
        <Tabs defaultActiveKey={defaultTab}>
          <Tab eventKey="posts" title="Posts">
            <div className="post-grid mt-4">
              {posts.length === 0 ? (
                <Alert variant="info">No posts yet.</Alert>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="post-thumbnail"
                    onClick={() => navigate(`/posts/${post.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={post.image || "/default_post.jpg"} alt={post.title}/>
                  </div>
                ))
              )}
            </div>
          </Tab>

          <Tab eventKey="followers" title="Followers">
            <div className="mt-4">
              {followers.length === 0 ? (
                <Alert variant="info">No followers yet.</Alert>
              ) : (
                followers.map((user) => (
                  <div key={user.id} className="border p-2 mb-2 rounded">
                    <strong>{user.username}</strong>
                  </div>
                ))
              )}
            </div>
          </Tab>

          <Tab eventKey="following" title="Following">
            <div className="mt-4">
              {following.length === 0 ? (
                <Alert variant="info">You’re not following anyone yet.</Alert>
              ) : (
                following.map((user) => (
                  <div key={user.id} className="border p-2 mb-2 rounded">
                    <strong>{user.username}</strong>
                  </div>
                ))
              )}
            </div>
          </Tab>

          <Tab eventKey="follow-requests" title="Follow Requests">
            <div className="mt-4">
              {profile?.is_owner ? (
                <>
                  {/* Incoming Requests */}
                  <h5>📨 Incoming</h5>
                  {followRequests.received.length === 0 ? (
                    <Alert variant="info">No incoming follow requests.</Alert>
                  ) : (
                    followRequests.received.map((req) => (
                      <div
                        key={req.id}
                        className="d-flex justify-content-between align-items-center border p-2 mb-2 rounded"
                      >
                        <div>
                          <strong>{req.from}</strong> wants to follow you
                        </div>
                        <div className="d-flex gap-2">
                          {req.status === "accepted" ? (
                            <span className="badge bg-success align-self-center">✅ Accepted</span>
                          ) : (
                            <>
                              <Button size="sm" variant="success" onClick={() => acceptFollowRequestManually(req.id)}>
                                Accept
                              </Button>
                              <Button size="sm" variant="outline-danger" onClick={() => declineFollowRequestManually(req.id)}>
                                Decline
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Sent Requests */}
                  <h5 className="mt-4">📤 Sent</h5>
                  {followRequests.sent.length === 0 ? (
                    <Alert variant="info">No sent follow requests.</Alert>
                  ) : (
                    followRequests.sent.map((req) => (
                      <div
                        key={req.id}
                        className="d-flex justify-content-between align-items-center border p-2 mb-2 rounded"
                      >
                        <div>
                          You requested to follow <strong>{req.to}</strong>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          <span className="badge bg-secondary">⏳ Pending</span>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => cancelFollowRequest(req.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <Alert variant="warning">Only visible on your own profile.</Alert>
              )}
            </div>
          </Tab>

          <Tab eventKey="activity" title="Activity">
            <Alert variant="info" className="mt-4">
              Activity log like likes/comments/sittings here.
            </Alert>
          </Tab>
        </Tabs>
      </div>
    )}

    {/* Edit Modal */}
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Profile Picture</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mt-2">
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
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
);
};

export default Profile;
