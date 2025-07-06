import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

interface User {
  name: string;
  role: 'mentor' | 'mentee' | 'admin';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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

  if (!user) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}</h1>

      {user.role === 'mentor' && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/profile/edit')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/availability')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Set Availability
          </button>
          <button
            onClick={() => navigate('/requests')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Mentorship Requests
          </button>
        </div>
      )}

      {user.role === 'mentee' && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/profile/edit')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/users/mentors')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Find Mentors
          </button>
          <button
            onClick={() => navigate('/my-requests')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            My Requests
          </button>
          <button
            onClick={() => navigate('/my-sessions')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            My Sessions
          </button>
        </div>
      )}

      {/* Logout Button for all users */}
      <div className="mt-10">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
