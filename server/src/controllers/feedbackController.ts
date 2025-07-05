import { Request, Response } from 'express';
import Feedback from '../models/feedback';

export const submitFeedback = async (req: Request, res: Response):Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const sessionId = req.params.id;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    if (!rating || !sessionId) {
       res.status(400).json({ message: 'Rating and session ID are required' });
       return
    }

    // Make sure only mentors or mentees submit
    if (!['mentor', 'mentee'].includes(userRole)) {
       res.status(403).json({ message: 'Only mentors or mentees can submit feedback' });
       return
    }

    const existing = await Feedback.findOne({ sessionId, [`${userRole}Id`]: userId });
    if (existing) {
       res.status(409).json({ message: 'Feedback already submitted for this session' });
       return;
    }

    const feedback = await Feedback.create({
      sessionId,
      rating,
      comment,
      mentorId: userRole === 'mentor' ? userId : undefined,
      menteeId: userRole === 'mentee' ? userId : undefined,
    });

    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};
