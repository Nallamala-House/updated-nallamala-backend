import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const origin = request.headers.get('origin') || '';

    // Normalize frontend URL and allow common local origins
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || 'https://nallamala.iitmbs.org';
    const allowedOrigins = [frontendUrl, 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

    // Check if the request origin is allowed
    const isAllowedOrigin = allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');

    // Set origin for CORS - reflect origin if allowed, otherwise fallback to frontendUrl
    const setOrigin = isAllowedOrigin ? origin : (origin || frontendUrl);

    // Always set CORS headers
    response.headers.set('Access-Control-Allow-Origin', setOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: response.headers,
        });
    }

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
