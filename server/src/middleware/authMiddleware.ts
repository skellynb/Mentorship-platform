import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthPayload {
  userId: string;
  role: string;
}


export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}


//Middleware: Verify JWT token
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;


    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token failed' });
  }
};
// Middleware: Restrict route to specific roles
export const allowRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    next();
  };
  
};

