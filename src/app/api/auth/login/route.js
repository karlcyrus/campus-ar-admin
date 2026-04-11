import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSessionToken, setSessionCookie } from '@/lib/auth'

// POST /api/auth/login
export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      )
    }

    const [rows] = await pool.query(
      'SELECT id, username, password_hash, role, is_active FROM admins WHERE username = ?',
      [username]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      )
    }

    const admin = rows[0]

    if (!admin.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account is disabled. Contact your system administrator.' },
        { status: 403 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash)
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      )
    }

    const token = createSessionToken(admin)
    const res   = NextResponse.json({
      success: true,
      admin: { id: admin.id, username: admin.username, role: admin.role }
    })
    setSessionCookie(res, token)
    return res

  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}