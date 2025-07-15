import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Define the user type
interface User {
  name: string;
  role: 'mentor' | 'mentee' | 'admin';
  profilePictureUrl?: string;
}

export default function MainLayout({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Role-based menu items
  const mentorMenu = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Edit Profile', path: '/profile/edit' },
    { label: 'Set Availability', path: '/availability' },
    { label: 'Requests', path: '/requests' },
  ];

  const menteeMenu = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Edit Profile', path: '/profile/edit' },
    { label: 'Find Mentors', path: '/users/mentors' },
    { label: 'My Requests', path: '/my-requests' },
    { label: 'My Sessions', path: '/my-sessions' },
  ];

  const adminMenu = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Manage Users', path: '/admin/users' },
  ];

  const menuItems =
    user.role === 'mentor'
      ? mentorMenu
      : user.role === 'mentee'
      ? menteeMenu
      : adminMenu;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#dceeff] text-black p-6 flex flex-col">
        <div className="flex flex-col items-center mb-8">
          <img
            src={user.profilePictureUrl || '/default-avatar.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white object-cover"
          />
          <p className="mt-4 font-semibold text-lg">{user.name}</p>
          <p className="text-sm italic">{user.role.toUpperCase()}</p>
        </div>

        <nav className="flex flex-col gap-3 mb-auto">
          {menuItems.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`px-4 py-2 rounded hover:bg-blue-700 ${
                activePath === path ? 'bg-blue-800 font-bold' : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  );
}
