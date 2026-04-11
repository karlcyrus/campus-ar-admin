import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/nodes
export async function GET(request) {
  if (!requireAuth(request))
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const [rows] = await pool.query(
      'SELECT node_id, node_type FROM nodes ORDER BY node_id ASC'
    )
    return NextResponse.json({ success: true, data: rows })
  } catch (err) {
    console.error('[GET /api/nodes]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch nodes.' }, { status: 500 })
  }
}