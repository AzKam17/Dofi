/**
 * Generate a browser fingerprint for user tracking
 * Returns a SHA-256 hash based on browser characteristics
 */
export async function generateFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
    navigator.platform,
  ]

  const fingerprintString = components.join('|')

  return await hashString(fingerprintString)
}

/**
 * Generate SHA-256 hash of a string
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

/**
 * Get or generate fingerprint and store in cookie
 */
export async function getOrCreateFingerprint(): Promise<string> {
  // Check if fingerprint exists in cookie
  const existingFp = getCookie('user_fp')

  if (existingFp) {
    return existingFp
  }

  // Generate new fingerprint
  const fingerprint = await generateFingerprint()

  // Store in cookie for 1 year
  setCookie('user_fp', fingerprint, 365)

  return fingerprint
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }

  return null
}

/**
 * Set cookie with name, value and expiration days
 */
function setCookie(name: string, value: string, days: number): void {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`
}
