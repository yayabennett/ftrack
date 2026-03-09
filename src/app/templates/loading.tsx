export default function TemplatesLoading() {
    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky top-0 z-40 h-14 bg-background/60 backdrop-blur-[32px] px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-secondary/50 animate-pulse" />
                    <div className="h-6 w-24 bg-secondary/60 rounded-lg animate-pulse" />
                </div>
                <div className="w-9 h-9 rounded-full bg-secondary/60 animate-pulse" />
            </header>
            <div className="container mx-auto p-4 space-y-4 mt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-card ring-1 ring-white/5 rounded-2xl p-4 animate-pulse">
                        <div className="space-y-2 mb-4">
                            <div className="h-5 w-36 bg-secondary/50 rounded-md" />
                            <div className="h-3 w-56 bg-secondary/50 rounded-md" />
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div className="h-3 w-20 bg-secondary/50 rounded-md" />
                            <div className="h-9 w-24 bg-secondary/50 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
