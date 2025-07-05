//Controller to handle mentorship request submission
// This allows a mentee to send a mentorship request to a mentor
// It stores the request in the database with the sender (from), recipient (to), and an optional message

import { Request, Response } from 'express';
import RequestModel from '../models/request';
import { AuthenticatedRequest } from '../middleware/authMiddleware';



// GET /admin/matches
export const getMentorshipMatches = async (req: Request, res: Response) => {
  try {
    const matches = await RequestModel.find({ status: 'ACCEPTED' })
      .populate('from', 'name email')
      .populate('to', 'name email');

    res.json(matches);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ message: 'Failed to fetch mentorship matches' });
  }
};

export const createRequest = async (req: AuthenticatedRequest, res: Response):Promise<void> => {
  const fromUserId = (req as any).user.userId;
  const { to, message } = req.body;

  if (!to) {
     res.status(400).json({ message: 'Mentor ID (to) is required' }); // Validation: ensure mentor ID is provided
     return;
  }

  
  // Create and save a new mentorship request in the database
  const newRequest = await RequestModel.create({
    from: fromUserId,
    to,
    message,
  });

      // Respond with success message and saved request
  res.status(201).json(newRequest);
};


// Mentee view: Get all requests sent by the current user

export const getSentRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== 'mentee') {
      res.status(403).json({ message: 'Only mentees can view sent requests' });
      return;
    }

    const sentRequests = await RequestModel.find({ from: user.userId })
      .populate('to', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json(sentRequests);
  } catch (error: any) {
    console.error('❌ getSentRequests error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Mentor views the requests they’ve received
export const getReceivedRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user || user.role !== 'mentor') {
      res.status(403).json({ message: 'Only mentors can view received requests' });
      return;
    }

    const receivedRequests = await RequestModel.find({ to: user.userId })
      .populate('from', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(receivedRequests);
  } catch (error: any) {
    console.error('❌ getReceivedRequests error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



//  Mentor updates a mentorship request’s status
export const updateRequestStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const mentorId = (req as any).user.userId;
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  if (!['ACCEPTED', 'REJECTED'].includes(status)) {
    res.status(400).json({ message: 'Invalid status' });
    return;
  }

  // Find request and ensure the logged-in user is the recipient (mentor)
  const request = await RequestModel.findById(id);

  if (!request) {
    res.status(404).json({ message: 'Request not found' });
    return;
  }

  if (request.to.toString() !== mentorId) {
    res.status(403).json({ message: 'Not authorized to update this request' });
    return;
  }

  request.status = status;
  await request.save();

  res.status(200).json(request);
};

