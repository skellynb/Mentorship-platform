import { useEffect, useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Match {
  _id: string;
  from: { name: string; email: string };
  to: { name: string; email: string };
  status: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAllAdminData = async () => {
      try {
        const [usersRes, matchesRes, sessionsRes] = await Promise.all([
          fetch('http://localhost:5000/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/admin/matches', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/admin/sessions/count', {
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

    fetchAllAdminData();
  }, [token]);

  if (loading) return <p className="p-4">Loading admin dashboard...</p>;

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Sessions Count */}
      <div className="bg-blue-100 text-blue-800 p-4 rounded shadow w-fit">
        <p className="text-lg font-semibold">📊 Total Sessions Held: {sessionCount}</p>
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
            {users.map((user) => (
              <tr key={user._id}>
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin: Create New User */}
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
        const res = await fetch('http://localhost:5000/auth/register', {
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
          window.location.reload(); // Refresh user list
        }
      } catch  {
        alert('Something went wrong');
      }
    }}
    className="space-y-4 border p-4 rounded"
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
  
  );
}
