import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
            retry: 1, // Only retry once by default
            refetchOnWindowFocus: true, // Auto refetch on focus
        },
    },
})

// Custom persister interface
export interface Persister {
    persistClient(persistClient: any): void
    restoreClient(): Promise<any>
    removeClient(): void
}

export function createIDBPersister(idbValidKey: string): Persister {
    return {
        persistClient: async (client: any) => {
            if (typeof window !== 'undefined') {
                const { set } = await import('idb-keyval')
                await set(idbValidKey, client)
            }
        },
        restoreClient: async () => {
            if (typeof window !== 'undefined') {
                const { get } = await import('idb-keyval')
                return await get(idbValidKey)
            }
            return undefined
        },
        removeClient: async () => {
            if (typeof window !== 'undefined') {
                const { del } = await import('idb-keyval')
                await del(idbValidKey)
            }
        },
    }
}
