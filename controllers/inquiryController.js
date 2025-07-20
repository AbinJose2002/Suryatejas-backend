import Inquiry from '../models/Inquiry.js';

// Create a new inquiry from contact form
export const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, interests } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }
    
    // Create and save new inquiry
    const inquiry = new Inquiry({
      name,
      email,
      phone,
      message,
      interests
    });
    
    await inquiry.save();
    
    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully. We will contact you soon.',
      data: inquiry
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit your inquiry. Please try again.',
      error: error.message
    });
  }
};

// Get all inquiries (admin only)
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

// Update inquiry status (admin only)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status value
    if (!['new', 'contacted', 'in-progress', 'completed', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // Find and update the inquiry
    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status',
      error: error.message
    });
  }
};
