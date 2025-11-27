import { getOrCreateFingerprint } from './fingerprint'

/**
 * Track QR code scan by sending fingerprint to server
 */
export async function trackQRCodeScan(qrCode: string): Promise<void> {
  try {
    // Generate or retrieve fingerprint
    const fingerprint = await getOrCreateFingerprint()

    // Send fingerprint to server via beacon API (non-blocking)
    const url = `/api/scan/update-fingerprint`
    const data = JSON.stringify({
      qr_code: qrCode,
      fingerprint: fingerprint,
    })

    // Use sendBeacon for reliable tracking even if page unloads
    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' })
      navigator.sendBeacon(url, blob)
    } else {
      // Fallback to fetch
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
        keepalive: true,
      }).catch(() => {
        // Silently fail - tracking is not critical
      })
    }
  } catch (error) {
    // Silently fail - tracking should not affect user experience
    console.debug('Failed to track scan:', error)
  }
}
