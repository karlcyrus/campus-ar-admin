import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/offices — public, no auth required (read-only office data)
export async function GET(request) {
  try {
    const [rows] = await pool.query(`
      SELECT
        om.id,
        om.office_id,
        om.display_name   AS name,
        om.node_id        AS node,
        om.status,
        om.is_active,
        om.updated_at,
        om.image_url,
        n.node_type
      FROM office_mappings om
      JOIN nodes n ON om.node_id = n.node_id
      WHERE om.is_active = 1
      ORDER BY om.display_name ASC
    `)
    return NextResponse.json({ success: true, data: rows })
  } catch (err) {
    console.error('[GET /api/offices]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch offices.' }, { status: 500 })
  }
}

// POST /api/offices — publish all pending
export async function POST(request) {
  if (!requireAuth(request))
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  try {
    const [result] = await pool.query(`
      UPDATE office_mappings
      SET status = 'live', updated_at = NOW()
      WHERE status = 'pending' AND is_active = 1
    `)
    return NextResponse.json({
      success:   true,
      published: result.affectedRows,
      message:   `${result.affectedRows} office(s) published.`
    })
  } catch (err) {
    console.error('[POST /api/offices]', err)
    return NextResponse.json({ success: false, error: 'Publish failed.' }, { status: 500 })
  }
}