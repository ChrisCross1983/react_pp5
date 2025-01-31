import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import { axiosReq } from "../api/axios";
import { Link } from "react-router-dom";

const TopFollowedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopFollowedUsers = async () => {
      try {
        const response = await axiosReq.get("/profiles/top-followed/");
        setUsers(response.data);
      } catch (err) {
        setError("Failed to load top followed users.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopFollowedUsers();
  }, []);

  return (
    <Card className="shadow-sm p-3">
      <Card.Body>
        <Card.Title className="text-center">Top Followed Users</Card.Title>

        {loading ? (
          <Spinner animation="border" />
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : users.length === 0 ? (
          <p className="text-center">No users found.</p>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="mb-2">
              <Card.Body className="text-center">
                <img
                  src={user.profile_picture || "/default-avatar.png"}
                  alt="Profile"
                  className="rounded-circle mb-2"
                  width="50"
                  height="50"
                />
                <h6>
                  <Link to={`/profiles/${user.id}`}>{user.username}</Link>
                </h6>
                <p className="mb-0">Followers: {user.follower_count}</p>
              </Card.Body>
            </Card>
          ))
        )}
      </Card.Body>
    </Card>
  );
};

export default TopFollowedUsers;
