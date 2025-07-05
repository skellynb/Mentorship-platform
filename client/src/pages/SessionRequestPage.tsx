import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { useNavigate } from 'react-router-dom';

dayjs.extend(weekday);
dayjs.extend(isSameOrAfter);

function getNextDateForDay(dayName: string): string {
  const daysMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2,
    Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
  };

  const today = dayjs();
  const targetDay = daysMap[dayName];
  let date = today.weekday(targetDay);

  if (date.isSameOrAfter(today, 'day')) {
    date = date.add(1, 'week');
  }

  return date.format('YYYY-MM-DD');
}

interface RequestType {
  _id: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  to: {
    _id: string;
    name: string;
  };
}

interface Slot {
  _id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface BookedState {
  [mentorId: string]: boolean;
}

export default function SessionRequestPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookedMentors, setBookedMentors] = useState<BookedState>({});
  const [messages, setMessages] = useState<{ [mentorId: string]: string }>({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/requests/sent', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((req: RequestType) => req.status !== 'REJECTED');
        setRequests(filtered);
      });
  }, [token]);

  const fetchAvailability = async (mentorId: string) => {
    setSelectedMentorId((prev) => (prev === mentorId ? null : mentorId));
    setLoadingSlots(true);
    try {
      const res = await fetch(`http://localhost:5000/availability/${mentorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      console.error('Failed to load availability', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const bookSession = async (
    mentorId: string,
    dayOfWeek: string,
    startTime: string,
    endTime: string
  ) => {
    const date = getNextDateForDay(dayOfWeek);
    setBooking(true);

    try {
      const res = await fetch('http://localhost:5000/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mentorId, date, startTime, endTime }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => ({
          ...prev,
          [mentorId]: 'Session booked successfully!',
        }));
        setBookedMentors((prev) => ({ ...prev, [mentorId]: true }));

         alert('Session booked successfully!');

         setTimeout(() => {
          navigate('/my-sessions'); 
         }, 300);
        
      } else {
        const error = data.message || 'Booking failed.';
        setMessages((prev) => ({
          ...prev,
          [mentorId]: ` ${error}`,
        }));
      }
    } catch {
      setMessages((prev) => ({
        ...prev,
        [mentorId]: ' Could not book session. Please try again.',
      }));
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Mentorship Requests</h1>
      {requests.map((req) => {
        const isBooked = bookedMentors[req.to._id];
        const statusMessage = messages[req.to._id];
        console.log('isBooked:', isBooked, 'for mentor', req.to._id);

        return (
          <div key={req._id} className="bg-white rounded shadow p-4 mb-4">
            <h2 className="text-lg font-semibold">Mentor: {req.to.name}</h2>
            <p className="text-sm text-gray-700">Message: {req.message}</p>
            <p>
              Status: <span className="font-medium">{req.status}</span>
            </p>

            {req.status === 'ACCEPTED' && (
              <div>
                <button
                  onClick={() => fetchAvailability(req.to._id)}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {selectedMentorId === req.to._id ? 'Hide Slots' : 'Book Session'}
                </button>

                {selectedMentorId === req.to._id && (
                  <div className="mt-4">
                    {loadingSlots ? (
                      <p>Loading slots...</p>
                    ) : slots.length === 0 ? (
                      <p>No available slots for this mentor.</p>
                    ) : (
                      <div className="space-y-2">
                        {slots.map((slot) => (
                          <div
                            key={slot._id}
                            className="flex items-center justify-between border p-2 rounded"
                          >
                            <span>
                              {slot.dayOfWeek}: {slot.startTime} - {slot.endTime}
                            </span>
                            <button
                              className={`px-3 py-1 ${
                                isBooked
                                  ? 'bg-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              } text-white rounded`}
                              onClick={() =>
                                !isBooked &&
                                bookSession(
                                  req.to._id,
                                  slot.dayOfWeek,
                                  slot.startTime,
                                  slot.endTime
                                )
                              }
                              disabled={booking || isBooked}
                            >
                              {isBooked ? 'Booked' : booking ? 'Booking...' : 'Confirm'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {statusMessage && (
                      <p className="text-sm mt-2 text-gray-800">{statusMessage}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
