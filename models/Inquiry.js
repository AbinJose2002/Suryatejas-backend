import mongoose from 'mongoose';

// Define the Inquiry schema for contact form submissions
const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  interests: {
    websiteDesigning: {
      type: Boolean,
      default: false
    },
    graphicDesigning: {
      type: Boolean,
      default: false
    },
    appDevelopment: {
      type: Boolean,
      default: false
    },
    socialMediaMarketing: {
      type: Boolean,
      default: false
    },
    contentMarketing: {
      type: Boolean,
      default: false
    },
    websiteDevelopment: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'completed', 'archived'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the timestamp before saving
inquirySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
