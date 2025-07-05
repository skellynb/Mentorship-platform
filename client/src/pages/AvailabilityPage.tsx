import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

type AvailabilityBlock = {
  _id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityPage() {
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get('mentor'); // ?mentor=123
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([]);
  const [newBlock, setNewBlock] = useState<AvailabilityBlock>({
    dayOfWeek: dayjs().format('dddd'),
    startTime: '',
    endTime: ''
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const endpoint = mentorId
          ? `http://localhost:5000/availability/${mentorId}`
          : `http://localhost:5000/availability`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error loading availability');
        setAvailability(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load availability', err);
      }
    };

    fetchAvailability();
  }, [token, mentorId]);

  const handleAdd = async () => {
    if (!newBlock.dayOfWeek || !newBlock.startTime || !newBlock.endTime) return;

    try {
      const res = await fetch('http://localhost:5000/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newBlock)
      });

      const data = await res.json();
      setAvailability([...availability, data]);

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
      await fetch(`http://localhost:5000/availability/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      setAvailability(availability.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Error deleting availability', err);
    }
  };

  const isOwnAvailability = !mentorId;

  return (
    <div className="max-w-2xl mx-auto p-6">
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
              <option key={day} value={day}>
                {day}
              </option>
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
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
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
    </div>
  );
}
