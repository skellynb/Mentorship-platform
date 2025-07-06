// src/pages/SessionDetailsPage.tsx
import { useParams } from 'react-router-dom';
import FeedbackForm from './FeedbackForm';


export default function SessionDetailsPage() {
  const { sessionId } = useParams();

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Leave Feedback</h2>
      {sessionId ? (
        <FeedbackForm sessionId={sessionId} />
      ) : (
        <p>Session ID not found.</p>
      )}
    </div>
  );
}
