import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Item } from '@/models/Item';
import { Review } from '@/models/Review';
import { Document } from 'mongoose';

interface ItemDocument extends Document {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  seller: string;
  batteryLife?: string;
  age?: number;
  size?: string;
  material?: string;
  toObject(): any;
}

interface ReviewDocument extends Document {
  _id: string;
  itemId: string;
  rating: number;
}

export async function GET() {
  try {
    console.log('GET /api/admin/items başladı');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user) {
      console.log('Kullanıcı oturumu bulunamadı');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // session.user.role kontrol edilmeden önce böyle bir özelliğin olduğundan emin olun
    console.log('User role:', session.user.role);
    
    if (session.user.role !== 'admin') {
      console.log('Kullanıcı admin değil');
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await connectDB();
    console.log('Veritabanına bağlandı');

    const items = await Item.find({}).sort({ createdAt: -1 });
    console.log(`${items.length} ürün bulundu`);

    // Get reviews for each item
    const itemsWithStats = await Promise.all(
      items.map(async (item: ItemDocument) => {
        const reviews = await Review.find({ itemId: item._id });
        const averageRating = reviews.length > 0
          ? reviews.reduce((acc: number, review: ReviewDocument) => acc + review.rating, 0) / reviews.length
          : 0;
        
        return {
          ...item.toObject(),
          averageRating,
          totalReviews: reviews.length
        };
      })
    );

    return NextResponse.json(itemsWithStats);
  } catch (error) {
    console.error('Error in GET /api/admin/items:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, stock, category, image, batteryLife, age, size, material } = body;

    if (!name || !description || !price || !stock || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate category-specific required fields
    if (category === 'GPS Sport Watches' && !batteryLife) {
      return NextResponse.json(
        { error: 'Battery life is required for GPS watches' },
        { status: 400 }
      );
    }

    if ((category === 'Antique Furniture' || category === 'Vinyls') && !age) {
      return NextResponse.json(
        { error: 'Age is required for antique furniture and vinyls' },
        { status: 400 }
      );
    }

    if (category === 'Running Shoes' && !size) {
      return NextResponse.json(
        { error: 'Size is required for running shoes' },
        { status: 400 }
      );
    }

    if ((category === 'Antique Furniture' || category === 'Running Shoes') && !material) {
      return NextResponse.json(
        { error: 'Material is required for antique furniture and running shoes' },
        { status: 400 }
      );
    }

    await connectDB();

    let imageUrl;
    switch(category) {
      case 'GPS Sport Watches':
        imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop";
        break;
      case 'Antique Furniture':
        imageUrl = "https://images.unsplash.com/photo-1550226891-ef816aed4a98?q=80&w=1000&auto=format&fit=crop";
        break;
      case 'Vinyls':
        imageUrl = "https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=1000&auto=format&fit=crop";
        break;
      case 'Running Shoes':
        imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop";
        break;
      default:
        imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop";
    }

    // Create new item
    const newItem = await Item.create({
      name,
      description,
      price,
      stock,
      category,
      seller: session.user.id,
      image: imageUrl || image,
      ...(category === 'GPS Sport Watches' && { batteryLife }),
      ...(category === 'Antique Furniture' && { age, material }),
      ...(category === 'Vinyls' && { age }),
      ...(category === 'Running Shoes' && { size, material }),
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/items:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 