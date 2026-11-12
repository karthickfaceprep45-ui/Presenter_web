/**
 * Real-time Messaging Service powered by Pusher
 *
 * Uses:
 * 1. Pusher Channels (pusher-js) via VITE_PUSHER_KEY & VITE_PUSHER_CLUSTER
 * 2. Serverless / Vite dev trigger endpoint (/api/pusher/trigger)
 * 3. Local BroadcastChannel + LocalStorage fallback for zero-config testing between tabs/windows
 */

import Pusher from 'pusher-js'

const PUSHER_MAX_SAFE_BYTES = 8500
const PUSHER_INITIAL_CHUNK_CHARS = 5500
const CHUNK_EVENT_NAME = '__chunk'
const utf8Encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null

function utf8ByteLength(str) {
  if (!str) return 0
  return utf8Encoder ? utf8Encoder.encode(str).length : str.length * 2
}

export class RealtimeService {
  constructor(roomCode) {
    this.roomCode = String(roomCode).trim()
    this.channelName = `presenter-room-${this.roomCode}`
    this.listeners = new Map()
    this.subscribedCallbacks = new Set()
    this.chunkBuffers = new Map()
    this.seenMessageIds = new Set()
    this.instanceId = `rt_${Math.random().toString(36).slice(2, 9)}`
    this.msgSeq = 0
    this.provider = 'pusher'
    this.pusherClient = null
    this.channel = null
    this.broadcastChannel = null
    this.isSubscribed = false
    this.hasCompletedInitialSubscribe = false
    this.wasDisconnected = false
    this.isDestroyed = false

    this.init()
  }

  hasPusherConfigured() {
    const pusherKey = import.meta.env.VITE_PUSHER_KEY
    return Boolean(pusherKey && pusherKey.trim() !== '' && !pusherKey.includes('your_pusher'))
  }

  init() {
    // Always setup local BroadcastChannel for zero-latency local tab communication & fallback
    this.initBroadcastChannel()

    // Initialize Pusher if key is provided
    if (this.hasPusherConfigured()) {
      const pusherKey = import.meta.env.VITE_PUSHER_KEY.trim()
      const pusherCluster = (import.meta.env.VITE_PUSHER_CLUSTER || 'mt1').trim()
      this.initPusher(pusherKey, pusherCluster)
    } else {
      console.info(`[Realtime] Running in local BroadcastChannel mode for room: ${this.roomCode} (Add VITE_PUSHER_KEY for remote sync)`)
      Promise.resolve().then(() => {
        if (!this.isDestroyed) {
          this.isSubscribed = true
          this.hasCompletedInitialSubscribe = true
          this.emitSubscribed({ isReconnect: false })
        }
      })
    }
  }

  // --- Pusher Initialization ---
  initPusher(key, cluster) {
    try {
      this.pusherClient = new Pusher(key, {
        cluster: (cluster || 'mt1').trim(),
        forceTLS: true,
      })

      this.channel = this.pusherClient.subscribe(this.channelName)

      this.channel.bind('pusher:subscription_succeeded', () => {
        const isReconnect = this.hasCompletedInitialSubscribe && this.wasDisconnected
        this.isSubscribed = true
        this.hasCompletedInitialSubscribe = true
        if (isReconnect) {
          this.wasDisconnected = false
        }
        console.info(`[Realtime] Subscribed via Pusher (${cluster}) to channel: ${this.channelName}`)
        this.emitSubscribed({ isReconnect })
      })

      this.channel.bind('pusher:subscription_error', (err) => {
        console.error(`[Realtime] Pusher subscription error on ${this.channelName}:`, err)
      })

      this.pusherClient.connection.bind('error', (err) => {
        console.error('[Realtime] Pusher connection error:', err)
      })

      this.pusherClient.connection.bind('state_change', (states) => {
        if (!states) return
        if (states.current === 'unavailable' || states.current === 'disconnected' || states.current === 'failed') {
          if (states.current === 'failed') {
            console.error('[Realtime] Pusher connection failed. Check VITE_PUSHER_KEY and VITE_PUSHER_CLUSTER.')
          }
          if (this.hasCompletedInitialSubscribe) {
            this.wasDisconnected = true
          }
        } else if (
          states.current === 'connected' &&
          this.hasCompletedInitialSubscribe &&
          this.wasDisconnected
        ) {
          this.wasDisconnected = false
          this.emitSubscribed({ isReconnect: true })
        }
      })

      // Single global dispatcher avoids duplicate firing with per-event bind()
      this.channel.bind_global((event, data) => {
        if (event.startsWith('pusher:')) return
        this.handleIncomingEvent(event, data)
      })
    } catch (err) {
      console.warn('[Realtime] Failed to initialize Pusher, using BroadcastChannel:', err)
    }
  }

  // --- Local BroadcastChannel Fallback ---
  initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(this.channelName)
      this.broadcastChannel.onmessage = (event) => {
        const { event: evt, data, _msgId } = event.data || {}
        if (evt) {
          this.handleIncomingEvent(evt, data, _msgId)
        }
      }
    }

    // Storage event listener for cross-tab sync in older contexts
    this.storageListener = (e) => {
      if (e.key === `__presenter_event_${this.channelName}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed && parsed.event) {
            this.handleIncomingEvent(parsed.event, parsed.data, parsed._msgId)
          }
        } catch (_) {}
      }
    }
    window.addEventListener('storage', this.storageListener)
  }

  onSubscribed(callback) {
    if (typeof callback !== 'function') return () => {}
    this.subscribedCallbacks.add(callback)
    if (this.isSubscribed) {
      Promise.resolve().then(() => {
        if (!this.isDestroyed && this.subscribedCallbacks.has(callback)) {
          callback({ isReconnect: false })
        }
      })
    }
    return () => {
      this.subscribedCallbacks.delete(callback)
    }
  }

  emitSubscribed(info = { isReconnect: false }) {
    this.subscribedCallbacks.forEach((cb) => {
      try {
        cb(info)
      } catch (e) {
        console.error('[Realtime] Error in subscribed callback:', e)
      }
    })
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
    return () => this.off(event, callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  isDuplicateMessage(msgId) {
    if (!msgId) return false
    if (this.seenMessageIds.has(msgId)) return true
    this.seenMessageIds.add(msgId)
    if (this.seenMessageIds.size > 300) {
      const oldest = this.seenMessageIds.values().next().value
      if (oldest !== undefined) this.seenMessageIds.delete(oldest)
    }
    return false
  }

  handleIncomingEvent(event, data, msgId = null) {
    if (this.isDuplicateMessage(msgId)) return
    if (event === CHUNK_EVENT_NAME) {
      this.handleIncomingChunk(data)
      return
    }
    this.emitLocal(event, data)
  }

  handleIncomingChunk(chunk) {
    if (!chunk || !chunk.id || !chunk.event || typeof chunk.index !== 'number' || !chunk.total) {
      return
    }

    const now = Date.now()
    if (this.chunkBuffers.size > 20) {
      for (const [key, entry] of this.chunkBuffers.entries()) {
        if (now - entry.createdAt > 15000) {
          this.chunkBuffers.delete(key)
        }
      }
    }

    let buffer = this.chunkBuffers.get(chunk.id)
    if (!buffer) {
      buffer = {
        event: chunk.event,
        total: chunk.total,
        parts: new Array(chunk.total),
        received: 0,
        createdAt: now
      }
      this.chunkBuffers.set(chunk.id, buffer)
    }

    if (buffer.parts[chunk.index] === undefined) {
      buffer.parts[chunk.index] = chunk.part
      buffer.received++
    }

    if (buffer.received >= buffer.total) {
      this.chunkBuffers.delete(chunk.id)
      try {
        const fullJson = buffer.parts.join('')
        const parsed = JSON.parse(fullJson)
        this.emitLocal(buffer.event, parsed)
      } catch (e) {
        console.warn('[Realtime] Failed to reassemble chunked event:', e)
      }
    }
  }

  emitLocal(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data)
        } catch (e) {
          console.error(`[Realtime] Error in callback for event "${event}":`, e)
        }
      })
    }
  }

  splitJsonForPusherChunks(serialized, chunkId, event) {
    const parts = []
    let cursor = 0
    while (cursor < serialized.length) {
      let len = Math.min(PUSHER_INITIAL_CHUNK_CHARS, serialized.length - cursor)
      while (len > 1) {
        const candidate = serialized.slice(cursor, cursor + len)
        const probe = JSON.stringify({
          id: chunkId,
          event,
          index: parts.length,
          total: parts.length + 100,
          part: candidate
        })
        if (utf8ByteLength(probe) <= PUSHER_MAX_SAFE_BYTES) break
        len = Math.max(1, Math.floor(len * 0.7))
      }
      parts.push(serialized.slice(cursor, cursor + len))
      cursor += len
    }
    return parts
  }

  async postTrigger(event, data) {
    const res = await fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: this.channelName,
        event,
        data
      })
    })
    const result = await res.json().catch(() => null)
    if (!res.ok || !result || result.success !== true) {
      const reason = result?.error || result?.warning || `HTTP ${res.status} (expected JSON { success: true })`
      console.warn(`[Realtime] Pusher trigger failed for "${event}":`, reason)
      return false
    }
    return true
  }

  async sendPusherTrigger(event, data) {
    try {
      const serialized = JSON.stringify(data)
      if (utf8ByteLength(serialized) <= PUSHER_MAX_SAFE_BYTES) {
        await this.postTrigger(event, data)
        return
      }

      const chunkId = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      const parts = this.splitJsonForPusherChunks(serialized, chunkId, event)
      const total = parts.length
      for (let i = 0; i < total; i++) {
        if (this.isDestroyed) return
        const ok = await this.postTrigger(CHUNK_EVENT_NAME, {
          id: chunkId,
          event,
          index: i,
          total,
          part: parts[i]
        })
        if (!ok) return
      }
    } catch (err) {
      console.warn('[Realtime] Pusher trigger network warning:', err.message)
    }
  }

  toPlainPayload(data) {
    try {
      const json = JSON.stringify(data ?? {})
      return json === undefined ? {} : JSON.parse(json)
    } catch (_) {
      return data
    }
  }

  publishLocalFallback(event, plainData) {
    const _msgId = `${this.instanceId}_${++this.msgSeq}`
    const envelope = { event, data: plainData, _msgId }

    // BroadcastChannel for instant local tab sync (requires structured-cloneable plain data)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(envelope)
      } catch (_) {}
    }

    // LocalStorage event for cross-tab fallback
    try {
      localStorage.setItem(
        `__presenter_event_${this.channelName}`,
        JSON.stringify({ ...envelope, _t: Date.now() })
      )
    } catch (_) {}
  }

  // Publish event to room
  publish(event, data = {}) {
    if (this.isDestroyed) return

    const plainData = this.toPlainPayload(data)

    // 1. Trigger via serverless endpoint to Pusher (automatically chunked if > 7KB)
    if (this.hasPusherConfigured()) {
      this.sendPusherTrigger(event, plainData)
    }

    // 2. Local cross-tab delivery (BroadcastChannel + LocalStorage deduplicated by _msgId)
    this.publishLocalFallback(event, plainData)
  }

  // Best-effort event publish during pagehide/unload
  publishUnload(event, data = {}) {
    if (this.isDestroyed) return

    const plainData = this.toPlainPayload(data)

    if (this.hasPusherConfigured()) {
      const payload = JSON.stringify({
        channel: this.channelName,
        event,
        data: plainData
      })
      if (payload.length <= 60000) {
        let sent = false
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          try {
            const blob = new Blob([payload], { type: 'application/json' })
            sent = navigator.sendBeacon('/api/pusher/trigger', blob)
          } catch (_) {}
        }
        if (!sent && typeof fetch === 'function') {
          try {
            fetch('/api/pusher/trigger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true
            }).catch(() => {})
          } catch (_) {}
        }
      }
    }

    this.publishLocalFallback(event, plainData)
  }

  destroy() {
    this.isDestroyed = true
    this.isSubscribed = false
    this.listeners.clear()
    this.subscribedCallbacks.clear()
    this.chunkBuffers.clear()
    this.seenMessageIds.clear()

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close()
      } catch (_) {}
      this.broadcastChannel = null
    }

    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener)
    }

    if (this.channel && this.pusherClient) {
      try {
        this.channel.unbind_all()
        this.pusherClient.unsubscribe(this.channelName)
        this.pusherClient.disconnect()
      } catch (_) {}
    }
  }
}
