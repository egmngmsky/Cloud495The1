import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('GET /api/admin/users başladı');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user) {
      console.log('Kullanıcı oturumu bulunamadı');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // session.user.role kontrol edilmeden önce böyle bir özelliğin olduğundan emin olun
    console.log('User role:', session.user.role);
    
    // Admin rolü kontrolü
    if (session.user.role !== 'admin') {
      console.log('Kullanıcı admin değil');
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await connectDB();
    console.log('Veritabanına bağlandı');

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    console.log(`${users.length} kullanıcı bulundu`);
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
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

    const { name, username, email, password, role } = await request.json();

    if (!name || !username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.username === username ? 'Username already exists' : 'Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 