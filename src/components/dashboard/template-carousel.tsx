import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, CaretRight, CopySimple } from '@phosphor-icons/react/dist/ssr'

export async function TemplateCarousel({ userId }: { userId: string }) {
    const templates = await prisma.template.findMany({
        where: { userId },
        include: { exercises: { select: { id: true } } },
        orderBy: { order: 'asc' },
    })

    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-[300ms]">
            <div className="px-5 pb-2 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Einheiten</h2>
                <Link href="/templates" className="text-sm font-bold text-primary hover:underline underline-offset-4">Mehr</Link>
            </div>

            <div className="flex gap-4 overflow-x-auto px-5 pb-2 no-scrollbar scroll-smooth">
                {templates.length === 0 ? (
                    <Link href="/templates" className="min-w-[240px] flex active:scale-[0.96] transition-all duration-300 group card-hover">
                        <Card className="w-full bg-card/20 backdrop-blur-sm border-2 border-dashed border-white/10 hover:border-primary/50 rounded-[28px] p-4 flex flex-col items-center justify-center text-center gap-3 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-5 h-5 text-primary" weight="bold" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">Neue Einheit</p>
                                <p className="text-xs text-muted-foreground">Erstelle dein erstes Workout</p>
                            </div>
                        </Card>
                    </Link>
                ) : templates.map((template) => {
                    const tColor = template.color === 'primary' ? 'hsl(var(--primary))' : (template.color || 'hsl(var(--primary))')

                    return (
                        <Link key={template.id} href={`/templates/${template.id}`} className="min-w-[170px] active:scale-[0.96] transition-all duration-300 group card-hover relative">
                            <Card
                                className="bg-card/40 backdrop-blur-md shadow-soft rounded-[28px] overflow-hidden h-full group-hover:bg-card/60 transition-all duration-500 relative ring-0"
                                style={{
                                    boxShadow: `0 8px 30px -10px color-mix(in srgb, ${tColor} 50%, transparent)`,
                                    border: `1px solid color-mix(in srgb, ${tColor} 20%, transparent)`
                                }}
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(135deg, ${tColor} 0%, transparent 100%)` }} />

                                <CardContent className="p-4 flex flex-col justify-between h-full relative z-10">
                                    <div>
                                        <h3 className="font-bold text-[15px] mb-1 truncate">{template.name}</h3>
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{template.exercises.length} Übungen</p>
                                    </div>
                                    <div className="mt-4 flex items-center text-xs font-bold gap-1" style={{ color: tColor }}>
                                        START <CaretRight className="w-3 h-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
