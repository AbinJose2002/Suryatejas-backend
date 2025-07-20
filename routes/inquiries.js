import express from 'express';
import { createInquiry, getInquiries, updateInquiryStatus } from '../controllers/inquiryController.js';
// Import middleware for authorization if needed
// import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route for form submission
router.post('/', createInquiry);

// Admin routes (should be protected)
router.get('/', getInquiries);

// Make sure this route uses PATCH method correctly
router.patch('/:id/status', updateInquiryStatus);
router.put('/:id/status', updateInquiryStatus);

export default router;
