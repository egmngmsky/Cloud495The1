import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { Item } from '@/models/Item';
import { Review } from '@/models/Review';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to leave a review' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get the id from context
    const itemId = context.params.id;
    const userId = session.user.id;

    // Get request body
    const { rating, review } = await request.json();

    // Validate input
    if (!rating || !review) {
      return NextResponse.json(
        { error: 'Rating and review are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 10 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 10' },
        { status: 400 }
      );
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this item
    let existingReview = await Review.findOne({
      userId,
      itemId
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.review = review;
      await existingReview.save();

      // Get updated item with reviews
      const updatedItem = await Item.findById(itemId).populate('seller', 'name');
      const allReviews = await Review.find({ itemId })
        .populate('userId', 'name')
        .sort({ createdAt: -1 });

      // Calculate average rating
      const totalRatings = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = allReviews.length > 0 ? totalRatings / allReviews.length : 0;

      return NextResponse.json({
        ...updatedItem.toObject(),
        reviews: allReviews,
        averageRating,
        totalReviews: allReviews.length,
        message: 'Review updated successfully'
      });
    } else {
      // Create new review
      const newReview = new Review({
        userId,
        itemId,
        rating,
        review
      });

      await newReview.save();

      // Get updated item with reviews
      const updatedItem = await Item.findById(itemId).populate('seller', 'name');
      const allReviews = await Review.find({ itemId })
        .populate('userId', 'name')
        .sort({ createdAt: -1 });

      // Calculate average rating
      const totalRatings = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = allReviews.length > 0 ? totalRatings / allReviews.length : 0;

      // Update user's average rating if needed
      const user = await User.findById(userId);
      if (user) {
        // If user has a reviews array in their model
        if (Array.isArray(user.reviews)) {
          user.reviews.push({
            productId: updatedItem._id,
            rating,
            review,
            createdAt: new Date()
          });
          await user.save();
        }
      }

      return NextResponse.json({
        ...updatedItem.toObject(),
        reviews: allReviews,
        averageRating,
        totalReviews: allReviews.length,
        message: 'Review added successfully'
      });
    }
  } catch (error) {
    console.error('Error creating/updating review:', error);
    return NextResponse.json(
      { error: 'Failed to create/update review' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Get the id from context
    const itemId = context.params.id;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Get all reviews for this item
    const reviews = await Review.find({ itemId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRatings / reviews.length : 0;

    return NextResponse.json({
      averageRating,
      totalReviews: reviews.length,
      reviews: reviews.map(review => ({
        _id: review._id,
        user: review.userId,
        rating: review.rating,
        review: review.review,
        createdAt: review.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
} 