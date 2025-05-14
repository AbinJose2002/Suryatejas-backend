import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET user profile - protected route
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    // Find user by ID, excluding the password
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user profile data
    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role || 'User',
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
});

// PUT update user profile - protected route
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user.id;
    
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    
    await user.save();
    
    // Return updated user data
    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role || 'User',
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error while updating user profile' });
  }
});

export default router;
