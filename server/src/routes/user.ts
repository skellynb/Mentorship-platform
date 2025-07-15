import express from 'express';
import { protect, allowRoles } from '../middleware/authMiddleware';
import { getCurrentUser, updateProfile, getAllMentors, getUserById } from '../controllers/userController';
import { upload } from '../middleware/upload';



const router = express.Router();

//Phase 2 - Role protected test routes
router.get('/mentors-only', protect, allowRoles('mentor'), (req, res) => {
  res.json({ message: 'Welcome, mentor!' });
});

router.get('/admin-only', protect, allowRoles('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin!' });
});

router.get('/me', protect,getCurrentUser);

router.put('/me/profile', protect, upload.single('profilePicture'), updateProfile);

//valid jwt token and allows only mentees and admins access
router.get('/mentors', protect, allowRoles('mentee', 'admin'), getAllMentors);

router.get('/:id', protect, getUserById);






export default router;
