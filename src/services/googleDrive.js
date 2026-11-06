const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive'

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx']

export const DRIVE_ACCEPT = '.pdf,.doc,.docx'

let gisPromise = null
let tokenClient = null
let cachedToken = null

function getClientId() {
  const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID
  if (!clientId) {
    throw new Error(
      'Missing Google Drive client ID. Add VITE_GOOGLE_DRIVE_CLIENT_ID to your .env file.'
    )
  }
  return clientId
}

function getFolderId() {
  return import.meta.env.VITE_GOOGLE_DRIVE_PDF_FOLDER_ID || ''
}

function fileExtension(name = '') {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

function mimeTypeFor(file) {
  if (file.type) return file.type
  const extension = fileExtension(file.name)
  if (extension === 'pdf') return 'application/pdf'
  if (extension === 'doc') return 'application/msword'
  if (extension === 'docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  return 'application/octet-stream'
}

export function isAllowedDriveFile(file) {
  if (!file) return false
  return (
    ALLOWED_MIME_TYPES.has(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension(file.name))
  )
}

function loadGoogleIdentity() {
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google)
  }

  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${GIS_SCRIPT_SRC}"]`)

      if (existing) {
        existing.addEventListener('load', () => resolve(window.google), { once: true })
        existing.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), {
          once: true,
        })
        return
      }

      const script = document.createElement('script')
      script.src = GIS_SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => resolve(window.google)
      script.onerror = () => {
        gisPromise = null
        reject(new Error('Could not load Google sign-in. Check your connection and retry.'))
      }
      document.head.appendChild(script)
    })
  }

  return gisPromise
}

async function requestAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken
  }

  await loadGoogleIdentity()

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: getClientId(),
        scope: DRIVE_SCOPE,
        callback: (response) => {
          if (response.error) {
            cachedToken = null
            reject(new Error(response.error_description || 'Google Drive authorisation failed.'))
            return
          }

          cachedToken = {
            accessToken: response.access_token,
            expiresAt: Date.now() + (Number(response.expires_in) || 3600) * 1000 - 60_000,
          }
          resolve(cachedToken.accessToken)
        },
        error_callback: (error) => {
          cachedToken = null
          reject(new Error(error?.message || 'Google Drive authorisation was cancelled.'))
        },
      })
    }

    tokenClient.requestAccessToken({ prompt: '' })
  })
}

export function preloadGoogleDrive() {
  loadGoogleIdentity().catch(() => {
    // Retried on demand when the user uploads a file.
  })
}

export async function uploadFileToDrive(file) {
  if (!isAllowedDriveFile(file)) {
    throw new Error('Only PDF or Word documents (.pdf, .doc, .docx) can be uploaded.')
  }

  const accessToken = await requestAccessToken()
  const folderId = getFolderId()

  const metadata = {
    name: file.name,
    mimeType: mimeTypeFor(file),
  }

  if (folderId) {
    metadata.parents = [folderId]
  }

  const formData = new FormData()
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  )
  formData.append('file', file)

  const params = new URLSearchParams({
    uploadType: 'multipart',
    fields: 'id,name,mimeType,webViewLink',
    supportsAllDrives: 'true',
  })

  const response = await fetch(`${DRIVE_UPLOAD_URL}?${params.toString()}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })

  if (!response.ok) {
    let message = `Google Drive upload failed (${response.status}).`

    if (response.status === 401) {
      cachedToken = null
      message = 'Google Drive session expired. Please try again.'
    } else {
      try {
        const data = await response.json()
        if (data?.error?.message) message = data.error.message
      } catch {
        // Keep the default message.
      }
    }

    throw new Error(message)
  }

  const data = await response.json()

  return {
    id: data.id || '',
    name: data.name || file.name,
    mimeType: data.mimeType || metadata.mimeType,
    url: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
  }
}
