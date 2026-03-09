"use client"

import { useState, useEffect } from 'react';
import { getSyncQueueCount, processSyncQueue } from '@/lib/api-client';

export function useSyncQueue() {
    const [queueCount, setQueueCount] = useState(0);
    const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkQueue = async () => {
            const count = await getSyncQueueCount();
            setQueueCount(count);

            if (count > 0 && navigator.onLine) {
                processSyncQueue().then(async () => {
                    setQueueCount(await getSyncQueueCount());
                });
            }
        };

        const handleOnline = () => {
            setIsOnline(true);
            checkQueue();
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('sync-queue-updated', checkQueue);

        checkQueue();
        const interval = setInterval(checkQueue, 15000); // Check every 15s

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('sync-queue-updated', checkQueue);
            clearInterval(interval);
        };
    }, []);

    return { queueCount, isOnline };
}
