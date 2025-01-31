import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import axios from "axios";

export default function SittingRequests() {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const receivedRes = await axios.get("/api/posts/requests/incoming/");
      const sentRes = await axios.get("/api/posts/requests/sent/");
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {
      console.error("Error fetching requests", error);
    }
    setLoading(false);
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await axios.post(`/api/posts/requests/manage/${requestId}/`, { action });
      fetchRequests();
    } catch (error) {
      console.error("Error updating request", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Sitting Requests</h2>
      <Tabs defaultValue="received" className="w-full">
        <TabsList>
          <TabsTrigger value="received">Received Requests</TabsTrigger>
          <TabsTrigger value="sent">Sent Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="received">
          {loading ? (
            <p>Loading...</p>
          ) : receivedRequests.length > 0 ? (
            receivedRequests.map((request) => (
              <Card key={request.id} className="mb-4">
                <CardContent className="flex justify-between items-center">
                  <div>
                    <p><strong>From:</strong> {request.sender.username}</p>
                    <p><strong>Message:</strong> {request.message}</p>
                    <p><strong>Status:</strong> {request.status}</p>
                  </div>
                  {request.status === "pending" && (
                    <div className="space-x-2">
                      <Button onClick={() => handleRequestAction(request.id, "accept")}>
                        Accept
                      </Button>
                      <Button variant="destructive" onClick={() => handleRequestAction(request.id, "decline")}>
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No received requests.</p>
          )}
        </TabsContent>
        <TabsContent value="sent">
          {loading ? (
            <p>Loading...</p>
          ) : sentRequests.length > 0 ? (
            sentRequests.map((request) => (
              <Card key={request.id} className="mb-4">
                <CardContent>
                  <p><strong>To:</strong> {request.receiver.username}</p>
                  <p><strong>Message:</strong> {request.message}</p>
                  <p><strong>Status:</strong> {request.status}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No sent requests.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
