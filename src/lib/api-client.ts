import { get, set } from 'idb-keyval'
import type { SyncOperation } from '@/lib/types'

const QUEUE_KEY = 'offline-sync-queue'

// ─── Offline-aware mutation ───────────────────────────────────────────────────

export async function customFetch(url: string, options: { method: string; body?: unknown }) {
    if (typeof window !== 'undefined' && navigator.onLine) {
        try {
            const res = await fetch(url, {
                method: options.method,
                headers: { 'Content-Type': 'application/json' },
                body: options.body ? JSON.stringify(options.body) : undefined,
            })
            if (res.ok) return res.json()
        } catch (e) {
            console.warn('Network error, attempting to queue offline', e)
        }
    }

    if (options.method === 'GET') {
        throw new Error('Offline: Cannot queue GET requests')
    }

    const fallbackUUID = Date.now().toString(36) + Math.random().toString(36).substring(2)
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : fallbackUUID

    const queue = (await get<SyncOperation[]>(QUEUE_KEY)) || []
    const op: SyncOperation = { id, url, method: options.method, body: options.body, timestamp: Date.now() }
    queue.push(op)
    await set(QUEUE_KEY, queue)

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sync-queue-updated'))
    }

    return { success: true, offlineQueued: true, queuedId: id }
}

// ─── Offline sync queue processing ───────────────────────────────────────────

export async function processSyncQueue() {
    if (typeof window === 'undefined' || !navigator.onLine) return

    const queue = (await get<SyncOperation[]>(QUEUE_KEY)) || []
    if (queue.length === 0) return

    const remaining: SyncOperation[] = []
    let hasError = false

    for (const op of queue) {
        if (hasError) { remaining.push(op); continue }
        try {
            const res = await fetch(op.url, {
                method: op.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(op.body),
            })
            if (!res.ok) throw new Error('Sync returned status: ' + res.status)
        } catch (e) {
            console.error('Failed to sync operation', op, e)
            hasError = true
            remaining.push(op)
        }
    }

    await set(QUEUE_KEY, remaining)
    window.dispatchEvent(new Event('sync-queue-updated'))
}

export async function getSyncQueueCount(): Promise<number> {
    if (typeof window === 'undefined') return 0
    const queue = (await get<SyncOperation[]>(QUEUE_KEY)) || []
    return queue.length
}

// ─── Offline GET caching ──────────────────────────────────────────────────────

interface CacheEntry<T> {
    data: T
    cachedAt: number
}

const DEFAULT_TTL_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Fetches `url` from the network and caches in IndexedDB under `cacheKey`.
 * Falls back to the cached version if offline or the fetch fails.
 * Returns null if offline and no cache exists.
 */
export async function cachedGet<T>(
    url: string,
    cacheKey: string,
    ttlMs = DEFAULT_TTL_MS
): Promise<T | null> {
    if (typeof window === 'undefined') {
        // Server environment — fetch directly, no caching
        const res = await fetch(url)
        return res.ok ? res.json() : null
    }

    const isOnline = navigator.onLine

    if (isOnline) {
        try {
            const res = await fetch(url)
            if (res.ok) {
                const data: T = await res.json()
                const entry: CacheEntry<T> = { data, cachedAt: Date.now() }
                await set(cacheKey, entry)
                return data
            }
        } catch (e) {
            console.warn(`cachedGet: network error for ${url}, falling back to cache`, e)
        }
    }

    // Offline or fetch failed — try cache
    const cached = await get<CacheEntry<T>>(cacheKey)
    if (cached) {
        const age = Date.now() - cached.cachedAt
        if (age < ttlMs || !isOnline) {
            return cached.data
        }
    }

    return null
}

/**
 * Removes a cached entry from IndexedDB, forcing the next cachedGet to
 * re-fetch from the network. Call after mutations that invalidate the data.
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
    if (typeof window === 'undefined') return
    await set(cacheKey, undefined)
}
