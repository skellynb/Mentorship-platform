// src/pages/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../api';

export default function RegisterPage() {
const [form, setForm] = useState({ name: '', email: '', password: '', role: 'mentee', confirmPassword: '' });
const navigate = useNavigate();
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);


const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
// 1. Password match validation
  if (form.password !== form.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    // ✅ 2. Submit form to backend
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();

if (res.ok) {
localStorage.setItem('token', data.token);
navigate('/profile/edit');
} else {
alert(data.message || 'Registration failed');
}
 } catch (error) {
    console.error('Registration error:', error);
    alert('Something went wrong. Please try again.');
  }
};


return (
<div 
className="min-h-screen bg-cover bg-center flex flex-col items-center px-4 md:px-8 py-6"
style={{ backgroundImage: 'linear-gradient(to right, #dceeff, #ffe3e3)' }}
>
{/* Logo at the top */}
<img src="/logo.svg" alt="Mentoria Logo" className="w-70 h-auto mb-6" />


<div className="bg-[#dceeff] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_50px_rgba(0,0,0,0.5)] transition-shadow duration-300  p-6 md:p-8  min-h-[500px] flex flex-col justify-center items-center">
<div className="w-full max-w-md">
<form onSubmit={handleSubmit} className="space-y-4">

<h1 className="text-3xl font-bold text-[#ec4899] mb-4 text-center"
style={{ fontFamily: 'Poppins, sans-serif' }}
>Let's get you started</h1>

<div className="relative mb-4">
  <span className="absolute left-3 top-1/2 -translate-y-1/2">
  <img src="/name-icon.svg" alt="Name Icon" className="w-4 h-4" />
  </span>

  <input name="name" 
  type="text" 
  placeholder="Name" value={form.name} onChange={handleChange} className="border-2 border-[#ec4899]  focus:border-[#ec4899]  focus:outline-none pl-10 p-2 w-full rounded" required />

  </div>

<div className="relative mb-4">
    <span className="absolute left-3 top-1/2 -translate-y-1/2">
  <img src="/email-icon.svg" alt="Email Icon" className="w-4 h-4" />
  </span>
  <input name="email" 
  type="email" 
  placeholder="Email" 
  value={form.email} onChange={handleChange} className="border-2 border-[#ec4899]  focus:border-[#ec4899]  focus:outline-none pl-10 p-2 w-full rounded" required />
  </div>

  <div className="relative mb-4">
  <span className="absolute left-3 top-1/2 -translate-y-1/2">
  <img src="/password-icon.svg" alt="Password Icon" className="w-4 h-4" />
  </span>

  <input 
  name="password" 
  type={showPassword? 'text' : 'password'} placeholder="Password" 
  value={form.password} onChange={handleChange} className="border-2 border-[#ec4899]  focus:border-[#ec4899]  focus:outline-none pl-10 p-2 w-full rounded" required
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

   {/* Confirm Password*/}

  <div className="relative mb-4">
  <span className="absolute left-3 top-1/2 -translate-y-1/2">
  <img src="/password-icon.svg" alt="Password Icon" className="w-4 h-4" />
  </span>

  <input name="confirmPassword" 
  type={showConfirmPassword? 'text' : 'password'} placeholder="Re-type Password" value={form.confirmPassword} onChange={handleChange} className="border-2 border-[#ec4899]  focus:border-[#ec4899]  focus:outline-none pl-10 p-2 w-full rounded" required />
  {/* Toggle eye icon */}
<span
className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
onClick={() => setShowConfirmPassword(!showConfirmPassword)}
>
<img
src={showConfirmPassword ? '/hide-password.svg' : '/show-password.svg'}
alt={showConfirmPassword ? 'Hide password' : 'Show password'}
className="w-4 h-4"
/>
</span>

  </div>
  <div className="relative mb-4">
    <span className="absolute left-3 top-1/2 -translate-y-1/2">
  <img src="/role-icon.svg" alt="Role Icon" className="w-4 h-4" />
  </span>

  <select 
  name="role" 
  value={form.role} 
  onChange={handleChange} className="border-2 border-[#ec4899]  focus:border-[#ec4899]  focus:outline-none pl-10 p-2 w-full rounded">
    <option value="mentee">Mentee</option>
    <option value="mentor">Mentor</option>
  </select>
</div>

  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
</form>
</div>
</div>
</div>
);
  }
