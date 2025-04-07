import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import authOptions from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rating, review } = await request.json();

    if (!rating || !review) {
      return NextResponse.json(
        { error: 'Rating and review are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 10' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this product
    const existingReviewIndex = product.reviews.findIndex(
      (r) => r.userId.toString() === user._id.toString()
    );

    if (existingReviewIndex > -1) {
      // Update existing review
      product.reviews[existingReviewIndex] = {
        userId: user._id,
        rating,
        review,
        createdAt: new Date(),
      };
    } else {
      // Add new review
      product.reviews.push({
        userId: user._id,
        rating,
        review,
        createdAt: new Date(),
      });
    }

    await product.save();

    // Update user's reviews
    const userReviewIndex = user.reviews.findIndex(
      (r) => r.productId.toString() === product._id.toString()
    );

    if (userReviewIndex > -1) {
      // Update existing review
      user.reviews[userReviewIndex] = {
        productId: product._id,
        rating,
        review,
        createdAt: new Date(),
      };
    } else {
      // Add new review
      user.reviews.push({
        productId: product._id,
        rating,
        review,
        createdAt: new Date(),
      });
    }

    await user.save();

    // Return updated product with populated reviews
    const updatedProduct = await Product.findById(params.id)
      .populate({
        path: 'reviews.userId',
        select: 'name username',
      });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 