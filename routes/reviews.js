import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET all reviews with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, rating, highlighted, sort, limit = 10, page = 1 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'published'; // Default to show only published reviews for public access
    }
    
    if (rating) {
      filter.rating = parseInt(rating);
    }
    
    // Add support for highlighted parameter
    if (highlighted === 'true') {
      filter.highlighted = true;
    } else if (highlighted === 'false') {
      filter.highlighted = false;
    }
    
    // Build sort object
    let sortOption = { createdAt: -1 }; // Default sort by newest
    
    if (sort === 'highest') {
      sortOption = { rating: -1 };
    } else if (sort === 'lowest') {
      sortOption = { rating: 1 };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch reviews
    const reviews = await Review.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalReviews = await Review.countDocuments(filter);
    
    res.json({
      reviews,
      pagination: {
        total: totalReviews,
        page: parseInt(page),
        pages: Math.ceil(totalReviews / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

// GET review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Server error while fetching review' });
  }
});

// POST new review
router.post('/', async (req, res) => {
  try {
    const { reviewer, rating, content, projectTitle } = req.body;
    
    // Validate required fields
    if (!reviewer || !reviewer.name || !reviewer.email || !rating || !content) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Create new review
    const newReview = new Review({
      reviewer,
      rating,
      content,
      projectTitle,
      highlighted: false,
      status: 'published' // Setting to published directly for simplicity
    });
    
    await newReview.save();
    
    res.status(201).json({
      message: 'Review submitted successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
});

// PUT update review
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { 
      reviewer, 
      rating, 
      content, 
      projectTitle, 
      highlighted, 
      status,
      replyMessage,
      replyDate
    } = req.body;
    
    // Check if review exists
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Update fields if provided
    if (reviewer) {
      if (reviewer.name) review.reviewer.name = reviewer.name;
      if (reviewer.email) review.reviewer.email = reviewer.email;
      if (reviewer.company !== undefined) review.reviewer.company = reviewer.company;
    }
    
    if (rating) review.rating = rating;
    if (content) review.content = content;
    if (projectTitle !== undefined) review.projectTitle = projectTitle;
    if (highlighted !== undefined) review.highlighted = highlighted;
    if (status) review.status = status;
    
    // Handle reply message and date
    if (replyMessage !== undefined) {
      review.replyMessage = replyMessage;
      if (replyMessage && replyDate) {
        review.replyDate = replyDate;
      } else if (replyMessage) {
        review.replyDate = new Date();
      }
    }
    
    await review.save();
    
    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error while updating review' });
  }
});

// GET review statistics
router.get('/stats/summary', async (req, res) => {
  try {
    // Get total count of published reviews
    const totalCount = await Review.countDocuments({ status: 'published' });
    
    // Default response for empty database
    if (totalCount === 0) {
      return res.json({
        totalCount: 0,
        averageRating: 0,
        positivePercentage: 0,
        ratingDistribution: []
      });
    }
    
    // Calculate average rating
    const ratingData = await Review.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);
    
    const averageRating = ratingData.length > 0 
      ? parseFloat(ratingData[0].averageRating.toFixed(1)) 
      : 0;
    
    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    // Calculate positive percentage (4-5 stars)
    const positiveCount = ratingDistribution
      .filter(item => item._id >= 4)
      .reduce((sum, item) => sum + item.count, 0);
      
    const positivePercentage = totalCount > 0 
      ? Math.round((positiveCount / totalCount) * 100) 
      : 0;
    
    res.json({
      totalCount,
      averageRating,
      positivePercentage,
      ratingDistribution: ratingDistribution.map(item => ({
        rating: item._id,
        count: item.count,
        percentage: Math.round((item.count / totalCount) * 100)
      }))
    });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({ message: 'Server error while fetching review statistics' });
  }
});

export default router;
