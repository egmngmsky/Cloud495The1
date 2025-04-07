import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // Rating statistics
  totalRatingsGiven: {
    type: Number,
    default: 0,
  },
  sumOfRatingsGiven: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  // Reviews given by this user
  reviews: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    review: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Middleware to update average rating when a review is added
userSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.totalRatingsGiven = this.reviews.length;
    this.sumOfRatingsGiven = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = this.sumOfRatingsGiven / this.totalRatingsGiven;
  }
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;