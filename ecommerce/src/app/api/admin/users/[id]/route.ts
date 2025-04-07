import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {authOptions} from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { Item } from '@/models/Item';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE /api/admin/users/[id] başladı, ID:', params.id);

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

    // Silinecek kullanıcıyı bul
    const userToDelete = await User.findById(params.id);
    if (!userToDelete) {
      console.log('Kullanıcı bulunamadı:', params.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admin kullanıcısının silinmesini engelle
    if (userToDelete.role === 'admin') {
      console.log('Admin kullanıcısı silinemez');
      return NextResponse.json(
        { error: 'Cannot delete admin user' },
        { status: 400 }
      );
    }

    // Kullanıcıya ait ürünleri güncelle
    console.log('Kullanıcıya ait ürünler güncelleniyor');
    await Item.updateMany(
      { seller: params.id },
      { $set: { seller: session.user.id } }
    );

    // Kullanıcıyı sil
    console.log('Kullanıcı siliniyor:', params.id);
    await User.findByIdAndDelete(params.id);

    console.log('Kullanıcı başarıyla silindi');
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
} 