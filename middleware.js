import { NextResponse } from 'next/server'

export function middleware(req) {
  const hasSession = !!req.cookies.get('admin_session')?.value
  const path       = req.nextUrl.pathname

  if (path.startsWith('/dashboard') && !hasSession) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*'] }