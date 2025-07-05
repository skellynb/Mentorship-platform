import jwt from 'jsonwebtoken';

export function generateToken(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('❌ JWT_SECRET is missing. Check your .env and dotenv.config()');
    throw new Error('JWT_SECRET not defined');
  }
  

  return jwt.sign({ userId, role }, secret, { expiresIn: '1h' });
}
