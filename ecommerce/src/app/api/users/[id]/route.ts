import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Review } from '@/models/Review';
import mongoose from 'mongoose';

interface ReviewInterface {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  rating: number;
  review: string;
  createdAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Fetching user profile for ID: ${params.id}`);
    
    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.error('Invalid user ID format:', params.id);
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    
    await connectDB();
    
    // Fetch the user directly without nested reviews
    const user = await User.findById(params.id).select('-password');
    
    if (!user) {
      console.error('User not found:', params.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Fetch reviews separately for the user
    let reviews = [];
    let reviewsCount = 0;
    let averageRating = 0;
    
    try {
      const userReviews = await Review.find({ userId: params.id })
        .populate('itemId', 'name image')
        .sort({ createdAt: -1 });
        
      if (userReviews && userReviews.length > 0) {
        reviewsCount = userReviews.length;
        const sumRatings = userReviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = reviewsCount > 0 ? sumRatings / reviewsCount : 0;
        
        reviews = userReviews.map(review => ({
          id: review._id.toString(),
          itemId: review.itemId?._id.toString(),
          itemName: review.itemId?.name || 'Unknown Item',
          itemImage: review.itemId?.image || '/placeholder.png',
          rating: review.rating,
          review: review.review,
          createdAt: review.createdAt
        }));
      }
    } catch (reviewError) {
      console.error('Error fetching user reviews:', reviewError);
      // Continue without reviews if there's an error
    }
    
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      },
      reviews,
      reviewsCount,
      averageRating,
      success: true
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 