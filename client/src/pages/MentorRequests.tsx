import { useEffect, useState } from 'react';
import BASE_URL from '../api';

interface Request {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
  };
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export default function MentorRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
  fetch(`${BASE_URL}/requests/received`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      const pendingOnly = data.filter((req: Request) => req.status === 'PENDING');
      setRequests(pendingOnly);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, [token]);


  const updateRequestStatus = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await fetch(`${BASE_URL}/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Failed to update request');
        return;
      }

      // Update local state to reflect change
      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status } : req
        )
      );
    } catch (error) {
      console.error(error);
      alert('Failed to update request');
    }
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Incoming Mentorship Requests</h1>
      {requests.length === 0 ? (
        <p>No incoming requests.</p>
      ) : (
        requests.map((req) => (
          <div
            key={req._id}
            className="border rounded p-4 mb-3 bg-white shadow"
          >
            <p><strong>From:</strong> {req.from.name} ({req.from.email})</p>
            <p><strong>Message:</strong> {req.message || 'No message'}</p>
            <p><strong>Status:</strong> {req.status}</p>

            {req.status === 'PENDING' && (
              <div className="mt-2 space-x-2">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={() => updateRequestStatus(req._id, 'ACCEPTED')}
                >
                  Accept
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded"
                  onClick={() => updateRequestStatus(req._id, 'REJECTED')}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
