import mongoose from 'mongoose';



export type Role = 'admin' | 'mentor' | 'mentee';


//Interface for TypeScript typing
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  role: Role;
  bio: string; //? means its optional
  skills: string[];
  goals: string;
}

// Mongoose schema (this defines how it’s stored in MongoDB)
const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'mentor', 'mentee'], required: true },
  bio: String,
  skills: [String],
  goals: String
}, { timestamps: true });


//Actual model — used to create/find users
const UserModel = mongoose.model<IUser>('User', userSchema);
export default UserModel;