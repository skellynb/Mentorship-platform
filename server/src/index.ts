import dotenv from 'dotenv';
dotenv.config();




import express from 'express';
import cors from 'cors';


//routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';

import requestRoutes from './routes/request';

import adminRoutes from './routes/admin';
import sessionRoutes from './routes/session';
import availabilityRoutes from './routes/availability'
import feedbackRoutes from './routes/feedback'



// Middlewares
const app = express();



// Catch-all route
app.use(cors());


app.use('/users', userRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads')); // serve uploaded files



app.use('/auth', authRoutes);


app.use('/requests', requestRoutes);
app.use('/admin', adminRoutes);

app.use('/sessions', sessionRoutes);
app.use('/availability', availabilityRoutes);

app.use('/feedback', feedbackRoutes); 






app.get('/', (req, res) => {
  res.send('Mentorship backend is running!');
});


app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

export default app;