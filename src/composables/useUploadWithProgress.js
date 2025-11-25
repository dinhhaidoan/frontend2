// Reusable upload helper: XHR upload (progress) + Cloudinary image upload helper
export function uploadWithProgress(url, file, onProgress, opts = {}) {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url, true)
      // attempt to send cookies (backend auth via cookie)
      xhr.withCredentials = true

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const ct = xhr.getResponseHeader('content-type') || ''
          try {
            if (ct.includes('application/json')) return resolve(JSON.parse(xhr.responseText))
            if (xhr.responseText) return resolve(JSON.parse(xhr.responseText))
            return resolve({})
          } catch (e) {
            // Non-fatal: resolve with empty object
            return resolve({})
          }
        }
        return reject(new Error(`${xhr.status} ${xhr.statusText}: ${xhr.responseText || ''}`))
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))
      if (xhr.upload && typeof xhr.upload.onprogress !== 'undefined') {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      const fieldName = opts.fieldName || 'file'
      const fd = new FormData()
      fd.append(fieldName, file)
      if (opts.extra && typeof opts.extra === 'object') {
        for (const k of Object.keys(opts.extra)) fd.append(k, opts.extra[k])
      }

      xhr.send(fd)
    } catch (e) { reject(e) }
  })
}

export async function uploadImageToCloudinary(file, onProgress = null) {
  if (!file) return null
  const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
  const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''
  if (!CLOUD || !PRESET || CLOUD.includes('YOUR_')) {
    throw new Error('Cloudinary không được cấu hình (VITE_CLOUDINARY_CLOUD_NAME / UPLOAD_PRESET)')
  }
  const url = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`
  const res = await uploadWithProgress(url, file, onProgress, { fieldName: 'file', extra: { upload_preset: PRESET } })
  return res
}

export default {
  uploadWithProgress,
  uploadImageToCloudinary
}
