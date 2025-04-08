// src/components/DashboardSidebar.js

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosReq } from "../api/axios";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

export default function DashboardSidebar() {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [receivedRes, sentRes] = await Promise.all([
          axiosReq.get("/posts/requests/incoming/"),
          axiosReq.get("/posts/requests/sent/"),
        ]);
        setReceivedRequests(receivedRes.data?.results ?? receivedRes.data ?? []);
        setSentRequests(sentRes.data?.results ?? sentRes.data ?? []);
      } catch (err) {
        console.error("Error fetching requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const renderRequestItem = (req, type) => (
    <div key={req.id} className="mb-2 small">
      <strong>{type === "received" ? "From:" : "To:"}</strong> {type === "received" ? req.sender_username : req.receiver_username}
      <div>
        <Badge
          bg={
            req.status === "pending"
              ? "warning"
              : req.status === "accepted"
              ? "success"
              : "danger"
          }
        >
          {req.status}
        </Badge>
      </div>
    </div>
  );

  return (
    <Card className="mb-4 shadow-sm sidebar-card">
        <Card.Header className="bg-light fw-bold">🐾 Sitting Requests</Card.Header>
        <Card.Body>
            {loading ? (
            <Spinner animation="border" size="sm" />
            ) : (
            <>
                <Tabs defaultActiveKey="received" id="dashboard-sidebar-tabs" className="mb-2" fill>
                    <Tab eventKey="received" title="📥 Received">
                        {receivedRequests.length === 0 ? (
                        <p className="text-muted small mt-2">No received requests</p>
                        ) : (
                        receivedRequests.slice(0, 3).map((req) => renderRequestItem(req, "received"))
                        )}
                    </Tab>
                    <Tab eventKey="sent" title="📤 Sent">
                        {sentRequests.length === 0 ? (
                        <p className="text-muted small mt-2">No sent requests</p>
                        ) : (
                        sentRequests.slice(0, 3).map((req) => renderRequestItem(req, "sent"))
                        )}
                    </Tab>
                </Tabs>
                <div className="text-end">
                <Link to="/sitting-requests" className="btn btn-outline-primary btn-sm">
                    → View All
                </Link>
                </div>
            </>
            )}
        </Card.Body>
    </Card>
  );
}
