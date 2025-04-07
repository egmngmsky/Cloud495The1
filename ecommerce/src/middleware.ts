import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin')) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // @ts-ignore
    if (session.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Sabit Render URL'yi her zaman ayarla
  process.env.NEXTAUTH_URL = 'https://cloud495the1.onrender.com';
  
  return NextResponse.next();
}

// Auth API routeları ve diğer dinamik routelar için middleware çalıştır
export const config = {
  matcher: [
    '/api/auth/:path*',
    '/login',
    '/register',
    '/admin/:path',
    '/items/:path*',
    '/api/items/:path*',
    '/api/reviews/:path*',
  ],
}; 