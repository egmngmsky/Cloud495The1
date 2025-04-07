import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  review: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Vinyls', 'Antique Furniture', 'GPS Sport Watches', 'Running Shoes']
  },
  image: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batteryLife: String,
  age: Number,
  size: String,
  material: String,
  reviews: [reviewSchema],
}, {
  timestamps: true
});

// Virtual fields for rating statistics
itemSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / this.reviews.length;
});

itemSchema.virtual('totalReviews').get(function() {
  return this.reviews ? this.reviews.length : 0;
});

// Ensure virtuals are included in JSON output
itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

// Mongoose modelini oluşturmadan önce zaten var mı kontrol et
export const Item = mongoose.models.Item || mongoose.model('Item', itemSchema); 