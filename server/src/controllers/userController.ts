import { Request, Response } from 'express';
import UserModel from '../models/user';



// Admin: Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserModel.find().select('-password'); // Exclude password
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * Get the currently logged-in user's profile
 * This uses the userId stored in the JWT payload (req.user.userId)
 * Returns user data excluding the password
 */

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.userId;

  const user = await UserModel.findById(userId).select('-password'); // hide password
  if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
  }

  res.json(user);
};


/**
 * Update profile of the currently logged-in user
 * Allows user to update bio, skills, and goals
 */

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.userId;
  const { bio = '', skills = '[]', goals = '' } = req.body || {};


  const user = await UserModel.findById(userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

    
  // Handle profile picture upload (added)
  if (req.file) {
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  user.profilePictureUrl = imageUrl;
}


  // Only update if fields are provided

  user.bio = bio || user.bio;
  
  user.goals = goals || user.goals;

  try {
    const parsedSkills = JSON.parse(skills);
    if (Array.isArray(parsedSkills)) {
      user.skills = parsedSkills;
    }
  } catch {
    // If parsing fails, keep existing skills
  }

  await user.save();

  res.json({ message: 'Profile updated successfully', user });
};


/**
 * Get all users with role: 'mentor'
 * Supports optional filtering by skill (via query string ?skill=React)
 */
export const getAllMentors = async (req: Request, res: Response) => {
  const skill = req.query.skill as string | undefined;

    // Base query: role must be 'mentor'

  const query: any = { role: 'mentor' };

  // If skill is provided, filter using case-insensitive match
  if (skill) {
    query.skills = { $regex: new RegExp(skill, 'i') }; // case-insensitive match
  }

  const mentors = await UserModel.find(query).select('-password');
  res.json(mentors);
};

//get user by ID


export const getUserById = async (req: Request, res: Response):Promise<void> => {
  const userId = req.params.id;

  const user = await UserModel.findById(userId).select('-password');
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return; 
  }

  res.json(user);
};

export const updateUserRole = async (req: Request, res: Response):Promise<void> => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    // Check for valid roles
    if (!['mentor', 'mentee', 'admin'].includes(role)) {
       res.status(400).json({ message: 'Invalid role value' });
       return
    }

    const user = await UserModel.findById(userId);
    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return;
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};




