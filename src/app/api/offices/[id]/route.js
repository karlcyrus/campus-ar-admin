import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// PUT /api/offices/[id]
export async function PUT(request, { params }) {
  const admin = requireAuth(request)
  if (!admin)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = params
  try {
    const body = await request.json()
    const { node_id, display_name, image_url } = body

    if (!node_id)
      return NextResponse.json({ success: false, error: 'node_id is required.' }, { status: 400 })

    const [nodeCheck] = await pool.query(
      'SELECT node_id FROM nodes WHERE node_id = ?', [node_id]
    )
    if (nodeCheck.length === 0)
      return NextResponse.json({ success: false, error: `Node '${node_id}' does not exist.` }, { status: 400 })

    const [current] = await pool.query(
      'SELECT node_id, status, office_id FROM office_mappings WHERE id = ? AND is_active = 1', [id]
    )
    if (current.length === 0)
      return NextResponse.json({ success: false, error: 'Office not found.' }, { status: 404 })

    const old = current[0]

    await pool.query(`
      UPDATE office_mappings
      SET node_id = ?, display_name = COALESCE(?, display_name),
          image_url = ?, status = 'pending', updated_at = NOW(), updated_by = ?
      WHERE id = ? AND is_active = 1
    `, [node_id, display_name || null, image_url ?? null, admin.id, id])

    await pool.query(`
      INSERT INTO office_mapping_history
        (office_id, old_node_id, new_node_id, old_status, new_status, changed_by, change_note)
      VALUES (?, ?, ?, ?, 'pending', ?, 'Updated via admin panel')
    `, [old.office_id, old.node_id, node_id, old.status, admin.id])

    return NextResponse.json({ success: true, message: 'Office updated and marked as pending.' })
  } catch (err) {
    console.error('[PUT /api/offices/[id]]', err)
    return NextResponse.json({ success: false, error: 'Update failed.' }, { status: 500 })
  }
}

// DELETE /api/offices/[id]
export async function DELETE(request, { params }) {
  const admin = requireAuth(request)
  if (!admin)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const { id } = params
  try {
    const [current] = await pool.query(
      'SELECT office_id, node_id, status FROM office_mappings WHERE id = ? AND is_active = 1', [id]
    )
    if (current.length === 0)
      return NextResponse.json({ success: false, error: 'Office not found.' }, { status: 404 })

    const old = current[0]

    await pool.query(
      'UPDATE office_mappings SET is_active = 0, updated_at = NOW(), updated_by = ? WHERE id = ?',
      [admin.id, id]
    )

    await pool.query(`
      INSERT INTO office_mapping_history
        (office_id, old_node_id, new_node_id, old_status, new_status, changed_by, change_note)
      VALUES (?, ?, ?, ?, 'pending', ?, 'Deleted via admin panel')
    `, [old.office_id, old.node_id, old.node_id, old.status, admin.id])

    return NextResponse.json({ success: true, message: 'Office removed.' })
  } catch (err) {
    console.error('[DELETE /api/offices/[id]]', err)
    return NextResponse.json({ success: false, error: 'Delete failed.' }, { status: 500 })
  }
}