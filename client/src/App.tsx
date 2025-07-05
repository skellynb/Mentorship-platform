import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfileEditPage from './pages/ProfileEditPage';
import MentorsPage from './pages/MentorsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AvailabilityPage from './pages/AvailabilityPage';

import MentorRequests from './pages/mentorRequests';

import SessionRequestPage from './pages/SessionRequestPage';

import MySessionsPage from './pages/MySessionsPage';

import SessionDetailsPage from './pages/SessionDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect from "/" to "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/users/mentors" element={<MentorsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="/requests" element={<MentorRequests />} />
         <Route path="/my-requests" element={<SessionRequestPage />} />
         <Route path="/my-sessions" element={<MySessionsPage />} />
         <Route path="/sessions/:sessionId" element={<SessionDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App
