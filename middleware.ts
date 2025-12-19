import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/post-login(.*)',
  '/api/webhooks(.*)',
  '/api/setup-admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // Si el usuario está autenticado y está en /login, redirigir a /post-login
  if (userId && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/post-login', req.url));
  }

  // Rutas públicas: permitir acceso sin autenticación
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Si no hay usuario, redirigir a login
  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Permitir acceso - la validación de roles se hace en los layouts
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
