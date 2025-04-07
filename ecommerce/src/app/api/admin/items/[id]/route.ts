import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Item } from '@/models/Item';

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

    // Silinecek ürünü bul
    const itemToDelete = await Item.findById(params.id);
    if (!itemToDelete) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Ürünü sil
    await Item.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/items/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 