import { useEffect, useState } from 'react';
import BASE_URL from '../api';
import MainLayout from './MainLayout';

interface User {
  name: string;
  role: 'mentor' | 'mentee' | 'admin';
  profilePictureUrl?: string;
}

interface Session {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  mentorName: string;
  menteeName: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  const token = localStorage.getItem('token');

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUser(data);
    };

    fetchUser();
  }, [token]);

  // Fetch sessions after user loads
  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      const endpoint =
        user.role === 'mentee'
          ? `${BASE_URL}/sessions/mentee`
          : `${BASE_URL}/sessions/mentor`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setSessions(data);
    };

    fetchSessions();
  }, [user, token]);

  if (!user) return <p className="p-4">Loading...</p>;

  return (
    <MainLayout user={user}>
      {/* Welcome Banner */}
      <div className="flex items-center justify-between bg-[#dceeff] text-black rounded-lg p-6 mb-6 shadow-md">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome Back, <span className="text-blue-600">{user.name}</span>
          </h1>
        </div>
        <img
          src="/illustration.png"
          alt="Welcome Illustration"
          className="w-40 h-40 object-contain rounded"
        />
      </div>

      {/* Ongoing Sessions Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Your Ongoing Sessions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.length === 0 ? (
            <p className="text-gray-500">No upcoming sessions yet.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className="bg-red p-5 rounded-lg shadow-md border-l-4 border-blue-500 flex flex-col justify-between h-32"
              >
                <div>
                  <h3 className="text-lg font-bold text-blue-700 mb-1">
                    📅 {user.role === 'mentee' ? 'Mentor' : 'Mentee'}:{' '}
                    {user.role === 'mentee'
                      ? session.mentorName || 'Unknown'
                      : session.menteeName }
                  </h3>
                  <p className="text-sm text-gray-600">
                    🗓️ Date: {new Date(session.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    🕒 Time:{' '}
                    {new Date(session.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
