import { NextResponse } from 'next/server'

// GET /api/nsdk-token — returns a short-lived Niantic Spatial access token
// Uses the Service Account API key stored in NSDK_SERVICE_KEY env variable
// to exchange for a client-safe access token via Niantic's Identity Service.
//
// This endpoint is called by the Unity app on startup.
// No auth required — the returned token is short-lived and scoped to your project.

export async function GET() {
  const serviceKey = process.env.NSDK_SERVICE_KEY
  const serviceId  = process.env.NSDK_SERVICE_ID

  if (!serviceKey || !serviceId) {
    console.error('[GET /api/nsdk-token] NSDK_SERVICE_KEY or NSDK_SERVICE_ID not set in environment.')
    return NextResponse.json(
      { success: false, error: 'NSDK credentials not configured on server.' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch('https://api.nianticspatial.com/identity/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: serviceId,
        client_secret: serviceKey,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[GET /api/nsdk-token] Niantic token exchange failed (${response.status}): ${errorText}`)
      return NextResponse.json(
        { success: false, error: 'Token exchange failed.' },
        { status: 502 }
      )
    }

    const data = await response.json()

    // Niantic returns: { access_token, token_type, expires_in }
    return NextResponse.json({
      success: true,
      access_token: data.access_token,
      expires_in: data.expires_in,
    })
  } catch (err) {
    console.error('[GET /api/nsdk-token] Error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
