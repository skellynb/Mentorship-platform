// routes/session.ts
import express from 'express';
import {
  createSession,
  getMenteeSessions,
  getMentorSessions,
  getUserSessions,
} from '../controllers/sessionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Mentee books a session with a mentor
router.post('/', protect, createSession);

// Get sessions for currently logged-in mentee
router.get('/mentee', protect, getMenteeSessions);

// Get sessions for currently logged-in mentor
router.get('/mentor', protect, getMentorSessions);

// (Optional) Admin: Get sessions for any user
router.get('/user/:userId', protect, getUserSessions);

router.get('/my', protect, getUserSessions);


export default router;
