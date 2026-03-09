"use client"

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, createIDBPersister } from '@/lib/query-client'
import { useEffect, useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
    const [persister] = useState(() => typeof window !== 'undefined' ? createIDBPersister('ftrack-query-cache') : null)

    if (!persister) return <>{children}</>

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
        >
            {children}
        </PersistQueryClientProvider>
    )
}
