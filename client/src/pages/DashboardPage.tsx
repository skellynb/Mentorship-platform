import { useEffect, useState } from 'react';
import BASE_URL from '../api';
import MainLayout from './MainLayout';



interface User {
  name: string;
  role: 'mentor' | 'mentee' | 'admin';
  profilePicureUrl?: string;
}

export default function DashboardPage() {
  
  const [user, setUser] = useState<User | null>(null);
  const token = localStorage.getItem('token');

  
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
    <MainLayout user={user}>
   
     <div className="flex items-center justify-between bg-[#dceeff] text-black rounded-lg p-6 mb-6 shadow-md">
  <div>
    <h1 className="text-3xl font-bold">Welcome Back, <span className="text-blue-600">{user.name}</span></h1>
    
  </div>
  <img
    src="/illustration.png" 
    alt="Welcome Illustration"
    className="w-50 h-50 object-contain rounded"
  />
</div>

      
    </MainLayout>
  );
}
