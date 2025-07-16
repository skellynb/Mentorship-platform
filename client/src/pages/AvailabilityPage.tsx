import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import BASE_URL from '../api';

type AvailabilityBlock = {
  _id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityPage() {
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get('mentor');
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([]);
  const [newBlock, setNewBlock] = useState<AvailabilityBlock>({
    dayOfWeek: dayjs().format('dddd'),
    startTime: '',
    endTime: ''
  });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const isOwnAvailability = !mentorId;

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const endpoint = mentorId
          ? `${BASE_URL}/availability/${mentorId}`
          : `${BASE_URL}/availability`; // now works after backend fix

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error loading availability');

        // Optional: filter out expired blocks
        const now = dayjs();
        const filtered = data.filter((block: AvailabilityBlock) => {
          const blockDayIndex = daysOfWeek.indexOf(block.dayOfWeek);
          const nextBlockDate = dayjs().day(blockDayIndex);
          const blockTime = dayjs(`${nextBlockDate.format('YYYY-MM-DD')}T${block.endTime}`);
          return blockTime.isAfter(now); // Keep only upcoming
        });

        setAvailability(filtered);
      } catch (err) {
        console.error('Failed to load availability', err);
      }
    };

    fetchAvailability();
  }, [token, mentorId]);

  const hasOverlap = (newBlock: AvailabilityBlock) => {
    return availability.some(
      (block) =>
        block.dayOfWeek === newBlock.dayOfWeek &&
        !(
          newBlock.endTime <= block.startTime ||
          newBlock.startTime >= block.endTime
        )
    );
  };

  const handleAdd = async () => {
    if (!newBlock.dayOfWeek || !newBlock.startTime || !newBlock.endTime) return;
    if (hasOverlap(newBlock)) {
      alert('This time block overlaps with an existing one.');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newBlock)
      });

      const data = await res.json();
      setAvailability((prev) => [...prev, data]);

      setNewBlock({
        dayOfWeek: dayjs().format('dddd'),
        startTime: '',
        endTime: ''
      });
    } catch (err) {
      console.error('Error adding availability', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${BASE_URL}/availability/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      setAvailability((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Error deleting availability', err);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundImage: 'linear-gradient(to right, #dceeff, #ffe3e3)' }}
    >
      <div className="bg-white p-6 rounded shadow max-w-2xl w-full"
        style={{ fontFamily: 'Poppins, sans-serif' }}>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 bg-[#1e3a8a] text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ← Back to Dashboard
        </button>

        <h2 className="text-xl font-bold mb-4">
          {isOwnAvailability ? 'Set Your Weekly Availability' : 'Mentor Availability'}
        </h2>

        {isOwnAvailability && (
          <div className="space-y-3 mb-6">
            <select
              value={newBlock.dayOfWeek}
              onChange={(e) => setNewBlock({ ...newBlock, dayOfWeek: e.target.value })}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Day of Week</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>

            <input
              type="time"
              value={newBlock.startTime}
              onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
              className="border p-2 rounded w-full"
            />

            <input
              type="time"
              value={newBlock.endTime}
              onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
              className="border p-2 rounded w-full"
            />

            <button
              onClick={handleAdd}
              className="bg-[#1e3a8a] text-white px-4 py-2 rounded w-full"
            >
              Add Time Block
            </button>
          </div>
        )}

        <ul className="space-y-2">
          {availability.map((block) => (
            <li
              key={block._id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>
                {block.dayOfWeek}: {block.startTime} – {block.endTime}
              </span>
              {isOwnAvailability && (
                <button
                  onClick={() => handleDelete(block._id!)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>

        {!availability.length && (
          <p className="text-gray-500 text-center mt-4">No available slots yet.</p>
        )}
      </div>
    </div>
  );
}
