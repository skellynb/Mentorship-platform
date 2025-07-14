import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

export default function LoginPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);

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
<div
  className="min-h-screen bg-cover bg-center flex flex-col items-center px-4 md:px-8 py-6"
style={{ backgroundImage: 'linear-gradient(to right, #dceeff, #ffe3e3)' }}
>
{/* Logo at the top */}
<img src="/logo.svg" alt="Mentoria Logo" className="w-70 h-auto mb-6" />

{/* Two-column layout: form + image */}
<div className="flex flex-col md:flex-row gap-4 w-full max-w-6xl  items-stretch">

  

  {/* Right side - Login form */}
  
  <div className="w-full md:w-1/2 flex items-stretch">
    <div className="bg-[#dceeff] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_50px_rgba(0,0,0,0.5)] transition-shadow duration-300  p-6 md:p-8 w-full h-full min-h-[500px] flex flex-col justify-center">
      <form onSubmit={handleLogin} className=" flex flex-col gap-4">
        <h1 className="text-4xl font-bold mb-4 text-center text-[#ec4899] "
        style={{ fontFamily: 'Poppins, sans-serif' }}>Welcome to Mentoria</h1>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="relative mb-4">
  <span className="absolute left-3 top-1/2 -translate-y-1/2">
    <img src="/email-icon.svg" alt="Email Icon" className="w-4 h-4" />
  </span>
        <input
          type="email"
          placeholder="Email"
          className="border-2 border-[#ec4899]  focus:border-[#ec4899]  focus:outline-none pl-10 p-2 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        </div>

        <div className="relative mb-4">
  <span className="absolute left-3 top-1/2 -translate-y-1/2">
    <img src="/password-icon.svg" alt="Password Icon" className="w-4 h-4" />
  </span>
        <input
          type={showPassword? 'text' : 'password'}
          placeholder="Password"
          className="border-2 border-[#ec4899]  focus:border-[#ec4899]  focus:outline-none  pl-10 p-2 w-full rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* Toggle eye icon */}
  <span
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
    onClick={() => setShowPassword(!showPassword)}
  >
    <img
      src={showPassword ? '/hide-password.svg' : '/show-password.svg'}
      alt={showPassword ? 'Hide password' : 'Show password'}
      className="w-4 h-4"
    />
  </span>

        </div>

        <button className="bg-blue-600 text-white px-4 py-2 w-full rounded">
          Login
        </button>

        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-blue-600 hover:underline mt-4 block text-center w-full"
        >
          Don’t have an account? Register here
        </button>
      </form>
    </div>
  </div>

  {/* Left side - Image */}
  <div className="w-full md:w-1/2">
  <div className="h-full min-h-[500px] rounded-2xl overflow-hidden">
    <img 
      src="/mentorship illustration.jpg"
      alt="Mentorship Illustration"
      className="rounded-xl w-full h-full object-cover"
    />
  </div>
  </div>

</div>
</div>
);

}
