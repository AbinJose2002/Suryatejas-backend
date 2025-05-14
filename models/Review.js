import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      trim: true
    }
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  projectTitle: {
    type: String,
    trim: true
  },
  highlighted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['published', 'pending', 'rejected'],
    default: 'published'
  },
  replyMessage: {
    type: String,
    trim: true
  },
  replyDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
