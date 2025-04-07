import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Item } from '@/models/Item';
import { Review } from '@/models/Review';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get the id from context
    const id = context.params.id;
    
    const item = await Item.findById(id).populate('seller', 'name');
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Get reviews for this item
    const reviews = await Review.find({ itemId: id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRatings / reviews.length : 0;

    // Convert item to object and add reviews data
    const itemObj = item.toObject();
    return NextResponse.json({
      ...itemObj,
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 