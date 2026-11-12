import Pusher from 'pusher'

async function readParsedBody(req) {
  let raw = req.body
  if (raw === undefined || raw === null) {
    raw = await new Promise((resolve, reject) => {
      const chunks = []
      req.on('data', (chunk) => {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk)
      })
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      req.on('error', reject)
    })
  } else if (Buffer.isBuffer(raw)) {
    raw = raw.toString('utf8')
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    return trimmed ? JSON.parse(trimmed) : {}
  }
  return raw || {}
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = await readParsedBody(req)
    const { channel, event, data } = body || {}

    if (!channel || !event) {
      return res.status(400).json({ error: 'Missing channel or event' })
    }

    const appId = process.env.PUSHER_APP_ID || process.env.VITE_PUSHER_APP_ID
    const key = process.env.PUSHER_KEY || process.env.VITE_PUSHER_KEY
    const secret = process.env.PUSHER_SECRET || process.env.VITE_PUSHER_SECRET
    const cluster = process.env.PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER || 'mt1'

    if (!appId || !key || !secret || String(key).includes('your_pusher')) {
      return res.status(500).json({
        error: 'Pusher server credentials are not configured in environment variables.',
        warning: 'Pusher credentials not fully configured in environment variables. Local fallback active.'
      })
    }

    const pusher = new Pusher({
      appId: String(appId).trim(),
      key: String(key).trim(),
      secret: String(secret).trim(),
      cluster: String(cluster).trim(),
      useTLS: true
    })

    await pusher.trigger(channel, event, data)
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Pusher trigger error:', err?.status || '', err?.message || err, err?.body || '')
    return res.status(500).json({
      error: err?.message || 'Pusher trigger failed',
      details: err?.body || undefined
    })
  }
}

