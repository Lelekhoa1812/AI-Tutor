import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/auth/login' || path === '/auth/signup'

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || ''

  // Check if the path is public
  if (isPublicPath) {
    // If user is already logged in, redirect to dashboard
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } catch (error) {
        // If token is invalid, remove it and continue to login/signup
        const response = NextResponse.next()
        response.cookies.delete('token')
        return response
      }
    }
    return NextResponse.next()
  }

  // For protected routes, verify the token
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    return NextResponse.next()
  } catch (error) {
    // If token is invalid, redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('token')
    return response
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/signup'
  ]
} 