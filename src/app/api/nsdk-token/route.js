import { NextResponse } from 'next/server'

// GET /api/nsdk-token — exchanges the Service Account API key
// for a short-lived JWT access token via Niantic's Identity Service.
//
// Flow:
//   1. Unity app calls this endpoint on startup
//   2. This endpoint calls Niantic's Identity Service with the API key
//   3. Niantic returns a JWT access token
//   4. We forward the JWT to the Unity app
//
// The API key never leaves the server.

export async function GET() {
  const apiKey = process.env.NSDK_API_KEY

  if (!apiKey) {
    console.error('[GET /api/nsdk-token] NSDK_API_KEY not set in environment.')
    return NextResponse.json(
      { success: false, error: 'NSDK credentials not configured on server.' },
      { status: 500 }
    )
  }

  try {
    // Exchange API key for JWT via Niantic Spatial Identity Service
    const response = await fetch('https://spatial-identity.nianticspatial.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grantType: 'exchange_api_key_access_token',
        apiKey: apiKey,
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

    // Niantic returns: { accessToken: "JWT...", expiresAt: 1712345678 }
    return NextResponse.json({
      success: true,
      access_token: data.accessToken,
      expires_at: data.expiresAt,
    })
  } catch (err) {
    console.error('[GET /api/nsdk-token] Error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
