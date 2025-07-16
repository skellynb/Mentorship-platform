import express from 'express';
import { addAvailability, getAvailability, getOwnAvailability } from '../controllers/availabilityController';

import { protect } from '../middleware/authMiddleware';
const router = express.Router();

router.post('/', protect, addAvailability);
router.get('/:mentorId', protect, getAvailability);
router.get('/', protect, getOwnAvailability); 

export default router;
