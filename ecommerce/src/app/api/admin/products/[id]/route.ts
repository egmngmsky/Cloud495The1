import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import authOptions from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the product
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Remove product reviews from users
    await User.updateMany(
      { 'reviews.productId': params.id },
      { $pull: { reviews: { productId: params.id } } }
    );

    // Delete the product
    await Product.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 