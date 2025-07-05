import { Request, Response } from 'express';
import { Availability } from '../models/availability';

export const addAvailability = async (req: Request, res: Response):Promise<void> => {
  try {
    const mentorId = (req as any).user?.userId;
    const { dayOfWeek, startTime, endTime } = req.body;

    if (!mentorId || !dayOfWeek || !startTime || !endTime) {
       res.status(400).json({ error: 'All fields are required' });
       return;
    }

    const availability = await Availability.create({
      mentorId,
      dayOfWeek,
      startTime,
      endTime
    });

    res.status(201).json(availability);
  } catch (error) {
    console.error('Add availability error:', error);
    res.status(500).json({ error: 'Failed to add availability' });
  }
};


export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.params;
    const slots = await Availability.find({ mentorId });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};
