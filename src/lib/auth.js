import crypto from 'crypto'

export const COOKIE_NAME = 'admin_session'
const TTL_SEC = 60 * 60 * 8 // 8 hours
const SECRET  = process.env.AUTH_SECRET || 'change-this-in-env'

function b64url(input) {
  return Buffer.from(input).toString('base64url')
}

function sign(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
}

export function createSessionToken(admin) {
  const payload = {
    id:       admin.id,
    username: admin.username,
    role:     admin.role,
    exp:      Math.floor(Date.now() / 1000) + TTL_SEC,
  }
  const body = b64url(JSON.stringify(payload))
  const sig   = sign(body)
  return `${body}.${sig}`
}

export function verifySessionToken(token) {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  if (sign(body) !== sig) return null
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}

export function setSessionCookie(res, token) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    path:     '/',
    maxAge:   TTL_SEC,
  })
}

export function clearSessionCookie(res) {
  res.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export function requireAuth(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  return verifySessionToken(token)
}