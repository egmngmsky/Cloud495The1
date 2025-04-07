import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Admin rolünü kontrol et
    const currentUser = await User.findOne({ email: session.user?.email });
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Silinecek kullanıcıyı bul
    const userToDelete = await User.findById(params.id);
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admin kullanıcısının silinmesini engelle
    if (userToDelete.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin user' },
        { status: 400 }
      );
    }

    // Remove user's reviews from products
    await Product.updateMany(
      { 'reviews.userId': params.id },
      { $pull: { reviews: { userId: params.id } } }
    );

    // Kullanıcıyı sil
    await User.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 