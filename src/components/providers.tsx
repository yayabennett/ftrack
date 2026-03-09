"use client"

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, createIDBPersister } from '@/lib/query-client'
import { useEffect, useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
    const [persister, setPersister] = useState<any>(null)

    useEffect(() => {
        setPersister(createIDBPersister('ftrack-query-cache'))
    }, [])

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
