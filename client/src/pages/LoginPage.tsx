import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Helper to check profile completeness
 const isProfileComplete = (user: { bio?: string; skills?: string[]; goals?: string }) => {
  return !!user.bio && !!user.goals && (user.skills?.length ?? 0) > 0;
};


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Save token
      localStorage.setItem('token', data.token);

      // Fetch user profile with the token
      const profileRes = await fetch(`${BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        setError('Failed to fetch user profile');
        return;
      }

      // Redirect logic:
      if (profileData.role === 'admin') {
        // Admin always goes to admin users page
        navigate('/admin/users');
      } else {
        // Mentor or mentee:
        if (isProfileComplete(profileData)) {
          // Profile complete → dashboard
          navigate('/dashboard');
        } else {
          // Profile incomplete → edit profile page
          navigate('/profile/edit');
        }
      }
    } catch {
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center p-4"
    style={{ backgroundImage: 'linear-gradient(to right, #dceeff, #ffe3e3)' }}>

    <div className="flex  justify-center pt-8">
      <img
        src='/logo.svg'
        alt="Mentoria Logo"
        className="w-70 h-auto"
        />
     </div> 
      
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-3 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-4 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-blue-600 text-white px-4 py-2 w-full rounded">
          Login
        </button>

        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-blue-600 hover:underline mt-4"
        >
          Don’t have an account? Register here
        </button>
      </form>
      
    </div>
  );
}
