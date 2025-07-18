import { useEffect, useState } from 'react';

import BASE_URL from '../api';
import MainLayout from './MainLayout';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  profilePictureUrl?: string;
}

interface Match {
  _id: string;
  from: { name: string; email: string };
  to: { name: string; email: string };
  status: string;
}

export default function AdminUsersPage() {
  
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    };

    const fetchAllAdminData = async () => {
      try {
        const [usersRes, matchesRes, sessionsRes] = await Promise.all([
          fetch(`${BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/admin/matches`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/admin/sessions/count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const usersData = await usersRes.json();
        const matchesData = await matchesRes.json();
        const sessionsData = await sessionsRes.json();

        setUsers(usersData);
        setMatches(matchesData);
        setSessionCount(sessionsData.totalSessions || 0);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchAllAdminData();
  }, [token]);

  if (!user || loading) return <p className="p-4">Loading admin dashboard...</p>;

  return (
    <MainLayout user={user}>
      <div className="space-y-10">
        <h1 className="text-3xl font-bold text-blue-800">Control Hub</h1>

        <div className="bg-blue-100 text-blue-800 p-4 rounded shadow w-fit">
          <p className="text-lg font-semibold">Total Sessions Held: {sessionCount}</p>
        </div>

        {/* Users Table */}
        <div>
          <h2 className="text-xl font-semibold mb-2">All Users</h2>
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="border px-4 py-2">{u.name}</td>
                  <td className="border px-4 py-2">{u.email}</td>
                  <td className="border px-4 py-2">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create New User */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">Create New User</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements.namedItem('name') as HTMLInputElement).value;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const password = (form.elements.namedItem('password') as HTMLInputElement).value;
              const role = (form.elements.namedItem('role') as HTMLSelectElement).value;

              try {
                const res = await fetch(`${BASE_URL}/auth/register`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ name, email, password, role }),
                });

                const data = await res.json();
                if (!res.ok) {
                  alert(data.message || 'Registration failed');
                } else {
                  alert('User created successfully');
                  window.location.reload();
                }
              } catch {
                alert('Something went wrong');
              }
            }}
            className="space-y-4 border p-4 rounded bg-white"
          >
            <input name="name" type="text" placeholder="Name" required className="block border p-2 w-full" />
            <input name="email" type="email" placeholder="Email" required className="block border p-2 w-full" />
            <input name="password" type="password" placeholder="Password" required className="block border p-2 w-full" />
            <select name="role" required className="block border p-2 w-full">
              <option value="">Select role</option>
              <option value="mentor">Mentor</option>
              <option value="mentee">Mentee</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create User
            </button>
          </form>
        </div>

        {/* Matches List */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Mentorship Matches</h2>
          <div className="space-y-2">
            {matches.length === 0 ? (
              <p>No accepted mentorship matches yet.</p>
            ) : (
              matches.map((match) => (
                <div key={match._id} className="bg-white border p-3 rounded shadow">
                  <p>
                    <strong>Mentee:</strong> {match.from.name} ({match.from.email})
                  </p>
                  <p>
                    <strong>Mentor:</strong> {match.to.name} ({match.to.email})
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
