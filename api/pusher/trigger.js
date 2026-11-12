import Pusher from 'pusher'

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
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { channel, event, data } = body || {}

    if (!channel || !event) {
      return res.status(400).json({ error: 'Missing channel or event' })
    }

    const appId = process.env.PUSHER_APP_ID || process.env.VITE_PUSHER_APP_ID
    const key = process.env.PUSHER_KEY || process.env.VITE_PUSHER_KEY
    const secret = process.env.PUSHER_SECRET || process.env.VITE_PUSHER_SECRET
    const cluster = process.env.PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER || 'mt1'

    if (!appId || !key || !secret || key.includes('your_pusher')) {
      return res.status(400).json({
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
    console.error('Pusher trigger error:', err)
    return res.status(500).json({ error: err.message })
  }
}

