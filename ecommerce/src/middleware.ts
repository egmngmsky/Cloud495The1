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

  // Dinamik NEXTAUTH_URL ayarı
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  // Environment değişkenini ayarla
  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = baseUrl;
    console.log(`NEXTAUTH_URL set to: ${baseUrl}`);
  }
  
  // Eğer çıkış yapma işlemiyse, callback URL'yi ana sayfaya ayarla
  if (path.includes('/api/auth/signout')) {
    const callbackUrl = new URL('/', baseUrl).toString();
    const url = request.nextUrl.clone();
    url.searchParams.set('callbackUrl', callbackUrl);
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

// Auth API routeları ve diğer dinamik routelar için middleware çalıştır
export const config = {
  matcher: [
    '/api/auth/:path*',
    '/login',
    '/register',
    '/admin/:path*',
  ],
}; 