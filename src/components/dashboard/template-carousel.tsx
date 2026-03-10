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
        <section className="space-y-4">
            <div className="px-5 pb-2 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Einheiten</h2>
                <Link href="/templates" className="text-sm font-bold text-primary hover:underline underline-offset-4">Mehr</Link>
            </div>

            <div className="flex gap-4 overflow-x-auto px-5 pb-2 no-scrollbar scroll-smooth">
                {templates.length === 0 ? (
                    <Link href="/templates" className="min-w-[240px] flex active:scale-[0.98] transition-transform group">
                        <Card className="w-full bg-secondary/10 hover:bg-primary/5 transition-colors border-2 border-dashed border-border/50 hover:border-primary/50 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-5 h-5 text-primary" weight="bold" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">Neue Einheit</p>
                                <p className="text-xs text-muted-foreground">Erstelle dein erstes Workout</p>
                            </div>
                        </Card>
                    </Link>
                ) : templates.map((template) => (
                    <Link key={template.id} href={`/templates/${template.id}`} className="min-w-[170px] active:scale-95 transition-transform">
                        <Card className="bg-card border border-border/40 shadow-sm rounded-2xl overflow-hidden h-full">
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <div>
                                    <h3 className="font-bold text-[15px] mb-1 truncate">{template.name}</h3>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{template.exercises.length} Übungen</p>
                                </div>
                                <div className="mt-4 flex items-center text-xs font-bold text-primary gap-1">
                                    START <CaretRight className="w-3 h-3" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    )
}
