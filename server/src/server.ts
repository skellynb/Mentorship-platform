// server.ts
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db';
import app from './index';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});
