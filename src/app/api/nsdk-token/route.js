import { NextResponse } from 'next/server'

// GET /api/nsdk-token — returns the NSDK access token to the Unity app
//
// The Service Account API key is stored as an environment variable on Railway.
// The Unity app calls this endpoint on startup to retrieve it,
// so the key is never baked into the APK.
//
// If the key is ever compromised, just rotate it on the Niantic dashboard
// and update the env variable on Railway — no APK rebuild needed.

export async function GET() {
  const apiKey = process.env.NSDK_API_KEY

  if (!apiKey) {
    console.error('[GET /api/nsdk-token] NSDK_API_KEY not set in environment.')
    return NextResponse.json(
      { success: false, error: 'NSDK credentials not configured on server.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    access_token: apiKey,
  })
}
