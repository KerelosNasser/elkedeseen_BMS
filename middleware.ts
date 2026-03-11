import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('auth_session')?.value;
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAuthRoute) {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // We only strictly block /admin routes via middleware.
  // The actual check for role is done in the server actions & admin layouts.
  // But we can ensure a session exists for /admin routes quickly:
  if (isAdminRoute) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Same thing for other protected routes if desired
  // Currently, the homepage `/` requires a login? 
  // Wait, let's keep it simple: API or Server components will check exact session validity.
  // But to avoid flicker, let's redirect to /login if there's no session and it's not a public route.
  // According to requirements: "redirect to /login if no session" for /admin/*
  if (!sessionToken && !isAuthRoute && request.nextUrl.pathname !== '/' && request.nextUrl.pathname !== '/venues') {
      // return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
