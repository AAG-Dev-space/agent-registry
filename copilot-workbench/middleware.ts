import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to /api/backend/* paths
  if (request.nextUrl.pathname.startsWith('/api/backend/')) {
    // Get backend URL from environment (runtime)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:7601';

    // Build new URL by replacing /api/backend/ with backend URL + /api/
    const apiPath = request.nextUrl.pathname.replace('/api/backend', '/api');
    const targetUrl = new URL(apiPath, backendUrl);

    // Copy search params
    request.nextUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    // Rewrite to backend
    return NextResponse.rewrite(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/backend/:path*',
};
