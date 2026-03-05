import { get, set } from 'idb-keyval';

export type SyncOperation = {
    id: string;
    url: string;
    method: string;
    body: any;
    timestamp: number;
}

const QUEUE_KEY = 'offline-sync-queue';

export async function customFetch(url: string, options: { method: string, body?: any }) {
    if (typeof window !== 'undefined' && navigator.onLine) {
        try {
            const res = await fetch(url, {
                method: options.method,
                headers: { 'Content-Type': 'application/json' },
                body: options.body ? JSON.stringify(options.body) : undefined
            });
            if (res.ok) {
                return res.json();
            }
        } catch (e) {
            console.warn('Network error, attempting to queue offline', e);
        }
    }

    // Handle offline queue
    if (options.method === 'GET') {
        throw new Error('Offline: Cannot queue GET requests');
    }

    // Ensure crypto.randomUUID is available or fallback
    const fallbackUUID = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const idId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : fallbackUUID;

    const queue = (await get<SyncOperation[]>(QUEUE_KEY)) || [];
    const op: SyncOperation = {
        id: idId,
        url,
        method: options.method,
        body: options.body,
        timestamp: Date.now()
    };

    queue.push(op);
    await set(QUEUE_KEY, queue);

    // Trigger global event for UI updates
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sync-queue-updated'));
    }

    // Return success true so the UI can proceed optimistically
    return { success: true, offlineQueued: true, queuedId: idId };
}

export async function processSyncQueue() {
    if (typeof window === 'undefined' || !navigator.onLine) return;

    const queue = (await get<SyncOperation[]>(QUEUE_KEY)) || [];
    if (queue.length === 0) return;

    const remaining = [];
    let hasError = false;

    for (const op of queue) {
        if (hasError) {
            remaining.push(op); // If one fails, stop and queue the rest in order
            continue;
        }
        try {
            const res = await fetch(op.url, {
                method: op.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(op.body)
            });
            if (!res.ok) throw new Error('Sync returned status: ' + res.status);
        } catch (e) {
            console.error('Failed to sync operation', op, e);
            hasError = true;
            remaining.push(op);
        }
    }

    await set(QUEUE_KEY, remaining);
    window.dispatchEvent(new Event('sync-queue-updated'));
}

export async function getSyncQueueCount(): Promise<number> {
    if (typeof window === 'undefined') return 0;
    const queue = (await get<SyncOperation[]>(QUEUE_KEY)) || [];
    return queue.length;
}
