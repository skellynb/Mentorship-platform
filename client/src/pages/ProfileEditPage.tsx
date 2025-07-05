import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

//list of skills
const availableSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'UI/UX Design',
  'Project Management',
  'Python',
  'Django'
];

const skillOptions = availableSkills.map((skill) => ({
  label: skill,
  value: skill
}));

// Define user type here
type UserType = {
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'mentee';
  bio?: string;
  skills?: string[];
  goals?: string;
};

export default function ProfileEditPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [goals, setGoals] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setUser(data);
        setBio(data.bio || '');
        setSkills(data.skills || []);
        setGoals(data.goals || '');
        setLoading(false);
      } catch {
        navigate('/login');
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const isProfileComplete = () => {
    // Customize completeness check as you need
    return bio.trim() !== '' && skills.length > 0 && goals.trim() !== '';
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!isProfileComplete()) {
      setMessage('Please complete all fields: Bio, Skills, and Goals.');
      return; // do not navigate
    }

    try {
      const res = await fetch('http://localhost:5000/users/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio,
          skills,
          goals,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage('Profile updated successfully!');
      navigate('/dashboard'); // only navigate when profile is complete & successfully updated
    } catch (error: unknown) {
      if (error instanceof Error) {
      setMessage(error.message || 'Update failed');
      }
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleUpdate} // form submit triggers handleUpdate
        className="bg-white p-6 rounded shadow w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>

        {message && (
          <p className={`text-center mb-2 ${isProfileComplete() ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mb-3">
          <label className="block font-semibold">Name</label>
          <p className="p-2 bg-gray-100 rounded">{user?.name}</p>
        </div>

        <div className="mb-3">
          <label className="block font-semibold">Email</label>
          <p className="p-2 bg-gray-100 rounded">{user?.email}</p>
        </div>

        <div className="mb-3">
          <label className="block font-semibold">Role</label>
          <p className="p-2 bg-gray-100 rounded capitalize">{user?.role}</p>
        </div>

        <div className="mb-3">
          <label className="block font-semibold">Bio</label>
          <textarea
            className="w-full border p-2 rounded"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block font-semibold mb-1">Skills</label>
          <Select
            isMulti
            options={skillOptions}
            value={skillOptions.filter(opt => skills.includes(opt.value))}
            onChange={(selected) => {
              const selectedSkills = selected.map((s) => s.value);
              setSkills(selectedSkills);
            }}
          />
        </div>

        <div className="mb-3">
          <label className="block font-semibold">Goals</label>
          <input
            className="w-full border p-2 rounded"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 w-full rounded mt-4"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
