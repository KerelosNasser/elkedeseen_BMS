import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_at_least_32_chars_long"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_session')?.value;
  const { pathname } = request.nextUrl;


  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isPublicRoute = pathname === '/venues' || pathname === '/favicon.ico';
  const isAdminRoute = pathname.startsWith('/admin');


  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValid = true;
    } catch (err) {
      isValid = false;
    }
  }


  if (isValid && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }


  if (!isValid && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {

  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
