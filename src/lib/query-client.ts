import { QueryClient } from '@tanstack/react-query'
import { Persister } from '@tanstack/react-query-persist-client'

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

export function createIDBPersister(idbValidKey: string): Persister {
    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
