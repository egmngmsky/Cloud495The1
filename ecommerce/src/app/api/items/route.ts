import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Item } from '../../../models/Item';
import { Review } from '../../../models/Review';

export async function GET() {
  try {
    await connectDB();

    const items = await Item.find({}).sort({ createdAt: -1 });

    // Get reviews for each item
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const reviews = await Review.find({ itemId: item._id });
        const averageRating = reviews.length > 0
          ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
          : 0;
        
        const itemObj = item.toObject();
        return {
          ...itemObj,
          seller: itemObj.seller?.toString() || '',
          averageRating,
          totalReviews: reviews.length
        };
      })
    );

    return NextResponse.json(itemsWithStats);
  } catch (error) {
    console.error('Error in GET /api/items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 