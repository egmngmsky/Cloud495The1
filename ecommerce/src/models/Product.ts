import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  seller: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Vinyls', 'AntiqueFurniture', 'GPSSportWatches', 'RunningShoes'],
  },
  // Optional fields based on category
  batteryLife: {
    type: Number,
    required: function() {
      return this.category === 'GPSSportWatches';
    },
  },
  age: {
    type: Number,
    required: function() {
      return ['AntiqueFurniture', 'Vinyls'].includes(this.category);
    },
  },
  size: {
    type: String,
    required: function() {
      return this.category === 'RunningShoes';
    },
  },
  material: {
    type: String,
    required: function() {
      return ['AntiqueFurniture', 'RunningShoes'].includes(this.category);
    },
  },
  // Rating and reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
}, {
  timestamps: true,
});

// Middleware to update average rating when a review is added or modified
productSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRating / this.reviews.length;
    this.totalRatings = this.reviews.length;
  }
  next();
});

export default mongoose.models.Product || mongoose.model('Product', productSchema); 