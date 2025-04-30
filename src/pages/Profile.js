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
import { format } from 'date-fns';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";


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
  const [activityFeed, setActivityFeed] = useState([]);
  const [isRequestReceiver, setIsRequestReceiver] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "posts");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const fetchData = async () => {
    try {
      // Loading profile
      const profileRes = await axiosReq.get(`profiles/${id}/`);
      console.log("📦 Loaded profile:", profileRes.data);

      setProfile(profileRes.data);
      console.log("📈 KPIs from profile:", profileRes.data.followers_count, profileRes.data.following_count);
      setIsFollowing(profileRes.data.is_following);
      setFirstName(profileRes.data.first_name || "");
      setLastName(profileRes.data.last_name || "");
      setBio(profileRes.data.bio || "");

      const followersRes = await axiosReq.get(`/profiles/${id}/followers/`);
      const followingRes = await axiosReq.get(`/profiles/${id}/following/`);

      console.log("🐾 Followers:", followersRes.data);
      console.log("🐾 Following:", followingRes.data);

      setFollowers(Array.isArray(followersRes.data?.results) ? followersRes.data.results : []);
      setFollowing(Array.isArray(followingRes.data?.results) ? followingRes.data.results : []);

      // Fetch user activity
      const activityRes = await axiosReq.get("/profiles/activity/");
      setActivityFeed(activityRes.data || []);

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

      if (profileRes.data.is_following) {
        status = "accepted";
      } else if (sent) {
        status = "sent";
      } else if (received) {
        status = "received";
      }

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
    try {
      await axiosReq.delete("profiles/delete/");
      toast.success("🗑️ Profile deleted");
      navigate("/");
    } catch (err) {
      toast.error("❌ Failed to delete profile");
      console.error(err);
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
                ? profile.profile_picture
                : "/default-avatar.png"}
            onError={(e) => (e.target.src = "/default-avatar.png")}
            alt="Profile"
            className="profile-picture"
            loading="lazy"
            width="150"
            height="150"
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
                  <span
                    className="badge bg-light text-muted border ms-2"
                    style={{ fontSize: "0.75rem", padding: "0.3em 0.6em" }}
                  >
                    Follows you
                  </span>
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
                      onClick={() => setShowDeleteModal(true)}
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
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="pending-tooltip">
                      {isRequestReceiver
                        ? "You’ve received a follow request. Accept or decline it first to follow back."
                        : "You’ve already sent a follow request. Please wait for it to be accepted."}
                    </Tooltip>
                  }
                >
                  <span className="d-inline-block mt-2">
                    <Button variant="secondary" disabled style={{ pointerEvents: "none" }}>
                      ⏳ Pending
                    </Button>
                  </span>
                </OverlayTrigger>
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
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
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
                    <img
                      src={post.image || "/default_post.jpg"}
                      alt={post.title}
                      loading="lazy"
                      width="160"
                      height="160"
                    />
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
                <div className="d-flex flex-column gap-3">
                  {followers.map((user) => (
                    <div
                      key={user.id}
                      className="d-flex align-items-center border rounded p-2 shadow-sm follower-card"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${user.id}`);
                      }}
                    >
                      <img
                        src={
                          user.profile_picture?.includes("http")
                            ? user.profile_picture
                            : "/default-avatar.png"
                        }
                        alt="Follower Avatar"
                        className="rounded-circle me-3"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        onError={(e) => (e.target.src = "/default-avatar.png")}
                      />
                      <div>
                        <div className="fw-bold">{user.first_name || user.owner}</div>
                        {user.first_name && (
                          <small className="text-muted">@{user.owner}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab>

          <Tab eventKey="following" title="Following">
            <div className="mt-4">
              {following.length === 0 ? (
                <Alert variant="info">You’re not following anyone yet.</Alert>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {following.map((user) => (
                    <div
                      key={user.id}
                      className="d-flex align-items-center border rounded p-2 shadow-sm follower-card"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${user.id}`);
                      }}
                    >
                      <img
                        src={
                          user.profile_picture?.includes("http")
                            ? user.profile_picture
                            : "/default-avatar.png"
                        }
                        alt="Following Avatar"
                        className="rounded-circle me-3"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        onError={(e) => (e.target.src = "/default-avatar.png")}
                      />
                      <div>
                        <div className="fw-bold">{user.first_name || user.owner}</div>
                        {user.first_name && (
                          <small className="text-muted">@{user.owner}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab>

          {profile?.is_owner && (
            <Tab eventKey="follow-requests" title="Follow Requests">
              <div className="mt-4">
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
              </div>
            </Tab>
          )}

          {profile?.is_owner ? (
            <Tab eventKey="activity" title="Activity">
              <div className="mt-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                {activityFeed.length === 0 ? (
                  <Alert variant="info">No recent activity yet.</Alert>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {activityFeed.map((item, index) => {
                      const formatted = format(new Date(item.timestamp), "PPPp");
                      const navigateTo = () => {
                        if (item.data?.sitting_id && !item.data?.is_deleted) {
                          return navigate(`/sitting-requests?focus=${item.data.sitting_id}`);                        
                        }
                        if (item.data?.post_id && !item.data?.is_deleted) {
                          return navigate(`/posts/${item.data.post_id}?tab=activity`);
                        }
                        if (item.data?.comment_id && item.data?.post_id && !item.data?.is_deleted) {
                          return navigate(`/posts/${item.data.post_id}?tab=activity#comment-${item.data.comment_id}`);
                        }
                        if (item.data?.user_id && !item.data?.is_deleted) {
                          return navigate(`/profile/${item.data.user_id}?tab=activity`);
                        }
                      };

                      const imagePreview =
                        item.data?.post_image || item.data?.image || item.data?.profile_picture || "/default_preview.jpg";
            
                      const titlePreview = item.data?.is_deleted
                        ? "[Deleted]"
                        : item.data?.title ||
                          item.data?.post_title ||
                          item.data?.content?.slice(0, 80) ||
                          item.data?.username ||
                          `${item.data?.first_name || ""} ${item.data?.last_name || ""}`.trim() ||
                          "Preview";
            
                      const isClickable =
                        !item.data?.is_deleted &&
                        (item.data?.post_id || item.data?.comment_id || item.data?.user_id || item.data?.sitting_id);
            
                      const commentPreview = item.data?.content;
                      const postTitle = item.data?.post_title;
            
                      return (
                        <div
                          key={index}
                          className="d-flex border rounded shadow-sm overflow-hidden"
                          style={{
                            cursor: isClickable ? "pointer" : "default",
                            opacity: item.data?.is_deleted ? 0.5 : 1,
                          }}
                          onClick={() => isClickable && navigateTo()}
                        >
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="object-fit-cover"
                            style={{ width: "80px", height: "80px" }}
                            loading="lazy"
                            onError={(e) => (e.target.src = "/default_preview.jpg")}
                          />
                          <div className="p-2 flex-grow-1">
                            <div className="fw-semibold">
                              {item.type === "post" && <>📝 Created a post: “{titlePreview}”</>}
                              {item.type === "comment" && (
                                <>
                                  💬 Commented: “{commentPreview}”
                                  <br />
                                  <span className="text-muted">on post: <strong>{postTitle}</strong></span>
                                </>
                              )}
                              {item.type === "like" && (
                                <>
                                  ❤️ Liked {item.data?.comment_id ? "a comment" : "a post"}: “{titlePreview}”
                                </>
                              )}
                              {item.type === "like_comment" && (
                                <>
                                  💗 Liked a comment: “{titlePreview}”
                                </>
                              )}
                              {item.type === "follow" && <>🙋 Sent follow request to @{titlePreview}</>}
                              {item.type === "follow_accepted" && <>🤝 Follow accepted by @{titlePreview}</>}
                              {item.type === "sitting" && <>🪑 Sent a sitting request to {titlePreview}</>}
                            </div>
                            <small className="text-muted d-block mt-1">{formatted}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Tab>
          ) : (
            <Alert variant="warning">Only visible on your own profile.</Alert>
          )}
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

    {/* Delete Confirmation Modal */}
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>⚠️ Are you sure you want to permanently delete your profile? This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={async () => {
          await handleDeleteProfile();
          setShowDeleteModal(false);
        }}>
          🗑️ Yes, delete
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
);
};

export default Profile;
