import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db';
import { Item } from '@/models/Item';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const products = await Item.find({})
      .select('name description price seller image category stock reviews')
      .lean()  // Convert documents to plain JavaScript objects
      .exec(); // Execute the query

    // Transform products to include calculated fields
    const transformedProducts = products.map(product => {
      const reviews = product.reviews || [];
      const totalRatings = reviews.length;
      const rating = totalRatings > 0
        ? reviews.reduce((acc: number, review: any) => acc + (review.rating || 0), 0) / totalRatings
        : 0;

      return {
        _id: product._id.toString(), // Convert ObjectId to string
        name: product.name,
        description: product.description,
        price: product.price,
        seller: product.seller,
        image: product.image,
        category: product.category,
        stock: product.stock,
        rating,
        totalRatings
      };
    });

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      name,
      description,
      price,
      seller,
      image,
      category,
      stock,
      batteryLife,
      age,
      size,
      material,
    } = await request.json();

    // Validate required fields
    if (!name || !description || !price || !seller || !image || !category || stock === undefined) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['Vinyls', 'AntiqueFurniture', 'GPSSportWatches', 'RunningShoes'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate category-specific fields
    if (category === 'GPSSportWatches' && !batteryLife) {
      return NextResponse.json(
        { error: 'Battery life is required for GPS sport watches' },
        { status: 400 }
      );
    }

    if (['AntiqueFurniture', 'Vinyls'].includes(category) && !age) {
      return NextResponse.json(
        { error: 'Age is required for antique furniture and vinyls' },
        { status: 400 }
      );
    }

    if (category === 'RunningShoes' && !size) {
      return NextResponse.json(
        { error: 'Size is required for running shoes' },
        { status: 400 }
      );
    }

    if (['AntiqueFurniture', 'RunningShoes'].includes(category) && !material) {
      return NextResponse.json(
        { error: 'Material is required for antique furniture and running shoes' },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Item.create({
      name,
      description,
      price,
      seller,
      image,
      category,
      stock,
      batteryLife,
      age,
      size,
      material,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 