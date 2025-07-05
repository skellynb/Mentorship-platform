import express from 'express';
import { protect, allowRoles } from '../middleware/authMiddleware';
import { getAllUsers, updateUserRole  } from '../controllers/userController';
import { getSessionStats } from '../controllers/sessionController';

import { getMentorshipMatches } from '../controllers/requestController';


const router = express.Router();

router.get('/users', protect, allowRoles('admin'), getAllUsers);

router.put('/users/:id/role', protect, allowRoles ('admin'), updateUserRole );

router.get('/matches', protect, allowRoles('admin'), getMentorshipMatches);


router.get('/sessions/count', protect, allowRoles('admin'), getSessionStats);

export default router;