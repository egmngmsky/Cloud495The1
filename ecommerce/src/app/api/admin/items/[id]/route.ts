import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Item } from '@/models/Item';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE /api/admin/items/[id] başladı, ID:', params.id);
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user) {
      console.log('Oturum bulunamadı');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    console.log('DB bağlantısı kuruldu');

    // Admin rolünü kontrol et
    console.log('Kullanıcı ID kontrolü:', session.user.id);
    const currentUser = await User.findById(session.user.id);
    if (!currentUser || currentUser.role !== 'admin') {
      console.log('Kullanıcı admin değil:', currentUser?.role);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Silinecek ürünü bul
    const itemToDelete = await Item.findById(params.id);
    if (!itemToDelete) {
      console.log('Ürün bulunamadı:', params.id);
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    console.log('Ürün siliniyor:', params.id);
    
    await Item.findByIdAndDelete(params.id);

    console.log('Ürün başarıyla silindi');
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/items/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
} 