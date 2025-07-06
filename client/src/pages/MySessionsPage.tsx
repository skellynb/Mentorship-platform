// src/pages/MySessionsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

interface Session {
  _id: string;
  mentorName: string;
  date: string;
  startTime: string;
  endTime: string;
}

export default function MySessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${BASE_URL}/sessions/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data =>  
        setSessions(data))
      .catch(err => console.error('Failed to fetch sessions', err));
  }, [token]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Sessions</h1>
      {sessions.length === 0 ? (
        <p>No sessions booked yet.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map(session => (
            <li
              key={session._id}
              className="border p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <p><strong>Mentor:</strong> {session.mentorName}</p>
                <p><strong>Date:</strong> {session.date}</p>
                <p><strong>Time:</strong> {session.startTime} – {session.endTime}</p>
              </div>
              <button
                onClick={() => navigate(`/sessions/${session._id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Leave Feedback
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
