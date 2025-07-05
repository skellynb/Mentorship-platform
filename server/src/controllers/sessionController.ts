
import { Request, Response } from 'express';
import { Session } from '../models/session';
import feedback from '../models/feedback';
import { AuthenticatedRequest } from '../middleware/authMiddleware';



export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mentorId, date, startTime, endTime } = req.body;
    const menteeId = (req as any).user.userId;

    const existing = await Session.findOne({ mentorId, date, startTime });

    if (existing) {
      res.status(409).json({ error: 'Slot already booked' });
      return;
    }

    const session = await Session.create({ mentorId, menteeId, date, startTime, endTime });
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to book session' });
  }
};

export const getMentorSessions = async (req: Request, res: Response) => {
  try {
    const mentorId = (req as any).user.userId;
    const sessions = await Session.find({ mentorId })
      .populate('menteeId', 'name')
      .sort({ date: 1 });

     // For each session, check if feedback by this user exists
    const sessionIds = sessions.map((s) => s._id);
    const feedbacks = await feedback.find({
      user: mentorId,
      session: { $in: sessionIds },
    });  

    const feedbackMap = new Map();
    feedbacks.forEach((fb) => {
      feedbackMap.set(fb.sessionId.toString(), true);
    });

    // Add a `hasFeedback` property to each session
    const sessionsWithFeedbackFlag = sessions.map((s) => ({
      ...s,
      hasFeedback: feedbackMap.has(s._id.toString()),
    }));


    

    res.json(sessions);
  } catch (error) {
    console.error('Mentor sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch mentor sessions' });
  }
};

export const getMenteeSessions = async (req: Request, res: Response) => {
  try {
    const menteeId = (req as any).user.userId;
    const sessions = await Session.find({ menteeId })
      .populate('mentorId', 'name')
      .sort({ date: 1 });

    res.json(sessions);
  } catch (error) {
    console.error('Mentee sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch mentee sessions' });
  }
};

export const getUserSessions = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  try {
    const sessions = await Session.find({
      $or: [{ mentorId: userId }, { menteeId: userId }],
    })
      .sort({ date: 1 })
      .populate('mentorId', 'name')
      .populate('menteeId', 'name');

    const formatted = sessions.map(session => ({
      _id: session._id,
      mentorName: (session.mentorId as any).name,
      menteeName: (session.menteeId as any).name,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('User sessions error:', error);
    res.status(500).json({ message: 'Failed to fetch user sessions' });
  }
};



export const getSessionStats = async (req: Request, res: Response) => {
  try {
    const totalSessions = await Session.countDocuments();
    res.json({ totalSessions });
  } catch (error) {
    console.error('Failed to get session count:', error);
    res.status(500).json({ message: 'Error fetching session stats' });
  }
};