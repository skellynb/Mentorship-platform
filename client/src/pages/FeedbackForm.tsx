// src/components/FeedbackForm.tsx
import { useState } from 'react';

interface Props {
  sessionId: string;
}

export default function FeedbackForm({ sessionId }: Props) {
  const [message, setMessage] = useState(''); // This is needed
  const [rating, setRating] = useState(5); // Also needed
  const [submitted, setSubmitted] = useState(false);
  const token = localStorage.getItem('token');
  console.log('TOKEN:', token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`http://localhost:5000/feedback/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // This must be present or you'll get 401
      },
      body: JSON.stringify({ comment: message, rating }), // ✅ Now 'message' is defined
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert('Failed to submit feedback');
    }
  };

  return submitted ? (
    <p className="text-green-600">Thank you for your feedback!</p>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={4}
        placeholder="Write your feedback..."
        className="w-full border rounded p-2"
      />
      <input
        type="number"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        min={1}
        max={5}
        required
        className="w-full border rounded p-2"
        placeholder="Rating (1-5)"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Submit Feedback
      </button>
    </form>
  );
}
