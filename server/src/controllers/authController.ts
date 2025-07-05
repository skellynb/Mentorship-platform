import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import  UserModel  from '../models/user';
import { generateToken } from '../utils/generateToken';



// REGISTER
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!['mentor', 'mentee', 'admin'].includes(role)) {
    res.status(400).json({ message: 'Invalid role.' });
    return;
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await UserModel.create({
    name,
    email,
    password: hashed,
    role
  });

  const token = generateToken(newUser._id.toString(), newUser.role);

  res.status(201).json({
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
};

// LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(400).json({ message: 'Invalid. Please register' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }

  const token = generateToken(user._id.toString(), user.role);
  res.json({ token });
};

//LOGOUT

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Logged out (client must remove token)' });
};


export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById((req as any).user.userId).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user info' });
  }
};