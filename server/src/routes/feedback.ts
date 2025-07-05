// src/routes/feedback.ts
import express from 'express';
import { submitFeedback} from '../controllers/feedbackController';
import { protect } from '../middleware/authMiddleware'; // assumes JWT middleware

const router = express.Router();

// router.post('/', protect, submitFeedback); // mentee gives feedback

router.put('/sessions/:id/feedback', protect, submitFeedback);

router.post('/:id', protect, submitFeedback); 

export default router;
