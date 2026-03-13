import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_at_least_32_chars_long"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_session')?.value;
  const { pathname } = request.nextUrl;

  // 1. Define route types
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isPublicRoute = pathname === '/venues' || pathname === '/favicon.ico';
  const isAdminRoute = pathname.startsWith('/admin');

  // 2. Verify Token (Stateless - No DB check)
  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValid = true;
    } catch (err) {
      isValid = false;
    }
  }

  // 3. Logic: If logged in and trying to access login/register, go to home
  if (isValid && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Logic: If NOT logged in and trying to access protected routes, go to login
  // We protect everything EXCEPT auth routes and the specific public venues page
  if (!isValid && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // We match everything except static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
