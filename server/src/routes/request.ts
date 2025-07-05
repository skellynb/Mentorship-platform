// Routes related to mentorship requests
// This file defines the route for sending mentorship requests
// Only authenticated users with the 'mentee' role are allowed to access this route

import express from 'express';
import { createRequest, getSentRequests, getReceivedRequests, updateRequestStatus, getMentorshipMatches } from '../controllers/requestController';
import { protect, allowRoles } from '../middleware/authMiddleware';

const router = express.Router();

//POST /get/requests
// Mentees can send mentorship requests to mentors
// Middleware:
//   - protect: verifies JWT and sets req.user
//   - allowRoles('mentee'): ensures only mentees can send requests
router.post('/', protect, allowRoles('mentee'), createRequest);



router.get('/sent', protect, allowRoles('mentee'), getSentRequests);

router.get('/received', protect, allowRoles('mentor'), getReceivedRequests);

router.put('/:id', protect, allowRoles('mentor'), updateRequestStatus);

router.get('/matches', protect, allowRoles('admin'), getMentorshipMatches);



export default router;
