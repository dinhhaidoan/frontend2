// Helper to try fetching an image with credentials when <img src> returns 403
// Exports:
// - fetchImageAsBlobUrl(url): attempts fetch(url, { credentials: 'include' }) and returns a blob URL string
// - revokeBlobUrl(url): revokes a created blob URL

const _blobCache = new Map()

export async function fetchImageAsBlobUrl(url) {
  if (!url) return null
  if (_blobCache.has(url)) return _blobCache.get(url)

  try {
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) throw new Error('Not an image')
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    _blobCache.set(url, blobUrl)
    return blobUrl
  } catch (e) {
    // do not terminate other flows; bubble error to caller
    throw e
  }
}

export function revokeBlobUrl(url) {
  if (!url) return
  try {
    // try to find key by value
    for (const [k, v] of _blobCache.entries()) {
      if (v === url) {
        URL.revokeObjectURL(v)
        _blobCache.delete(k)
        return
      }
    }
    // otherwise revoke directly
    URL.revokeObjectURL(url)
  } catch (e) {
    // ignore
  }
}

export default { fetchImageAsBlobUrl, revokeBlobUrl }
