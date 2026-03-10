export default function StatsLoading() {
    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center justify-between border-b border-white/5">
                <div className="h-6 w-28 bg-secondary/60 rounded-lg animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-secondary/60 animate-pulse" />
            </header>
            <div className="container mx-auto p-4 space-y-6 mt-2">
                <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="bg-card ring-1 ring-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-secondary/50" />
                            <div className="h-8 w-12 bg-secondary/50 rounded-md" />
                            <div className="h-3 w-20 bg-secondary/50 rounded-md" />
                        </div>
                    ))}
                </div>
                <div className="bg-card ring-1 ring-white/5 rounded-2xl p-4 animate-pulse">
                    <div className="h-4 w-40 bg-secondary/50 rounded-md mb-2" />
                    <div className="h-3 w-56 bg-secondary/50 rounded-md mb-4" />
                    <div className="h-48 bg-secondary/30 rounded-xl" />
                </div>
            </div>
        </div>
    )
}
