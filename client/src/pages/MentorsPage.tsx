import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Mentor {
  _id: string;
  name: string;
  bio?: string;
  skills?: string[];
  role: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [skillFilter, setSkillFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  
  const fetchMentors = async (skill = '') => {
    setLoading(true);
    setError(null);

    try {
      let url = 'http://localhost:5000/users/mentors';
      if (skill) {
        url += `?skill=${encodeURIComponent(skill)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error(data.message || 'Access denied');

      setMentors(data);
    } catch (err: unknown) {
      console.error('Error fetching mentors:', err);
      setError('Failed to fetch mentors');
    } finally {
      setLoading(false);
    }
  };

  

  // Added empty dependency array to stop infinite re-rendering
  useEffect(() => {

    const fetchMentors = async (skill = '') => {
    setLoading(true);
    setError(null);

    try {
      let url = 'http://localhost:5000/users/mentors';
      if (skill) {
        url += `?skill=${encodeURIComponent(skill)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error(data.message || 'Access denied');

      setMentors(data);
    } catch (err: unknown) {
      console.error('Error fetching mentors:', err);
      setError('Failed to fetch mentors');
    } finally {
      setLoading(false);
    }
  };

    const fetchSentRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/requests/sent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const mentorIds = data.map((req: { to: { _id: string } }) => req.to?._id);
      setRequestedIds(mentorIds);
    } catch (err) {
      console.error('Could not fetch sent requests:', err);
    }
  };


    fetchMentors();
    fetchSentRequests();
  }, [token]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillFilter(e.target.value);
  };

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchMentors(skillFilter.trim());
  };

  const requestMentorship = async (mentorId: string) => {
    try {
      const res = await fetch('http://localhost:5000/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: mentorId,
          message: 'Hi, I’d love to be mentored by you!',
        }),
      });

      if (res.ok) {
        setRequestedIds((prev) => [...prev, mentorId]);
      } else {
        const error = await res.json();
        alert(error.message || 'Could not send request');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Something went wrong');
      }
    }
  };

  if (loading) return <p className="p-4">Loading mentors...</p>;

  return (
    <div className="p-6">
      {/* ✅ Back to dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-4">Mentors</h1>

      {/* Skill Filter Form */}
      <form onSubmit={handleFilterSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Filter by skill"
          value={skillFilter}
          onChange={handleFilterChange}
          className="border p-2 rounded mr-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Filter
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid gap-4">
        {mentors.length === 0 ? (
          <p>No mentors found for this skill.</p>
        ) : (
          mentors.map((mentor) => {
            const alreadyRequested = requestedIds.includes(mentor._id);
            return (
              <div
                key={mentor._id}
                className="bg-white p-4 rounded shadow border border-gray-200"
              >
                <h2 className="text-lg font-semibold">{mentor.name}</h2>
                <p className="text-gray-600">{mentor.bio || 'No bio provided.'}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Skills: {mentor.skills?.join(', ') || 'N/A'}
                </p>

                <button
                  className={`mt-3 px-4 py-2 rounded ${
                    alreadyRequested
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  onClick={() => !alreadyRequested && requestMentorship(mentor._id)}
                  disabled={alreadyRequested}
                >
                  {alreadyRequested ? 'Requested' : 'Request Mentorship'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
