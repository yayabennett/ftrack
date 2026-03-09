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
            <div className="px-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CopySimple className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Einheiten</h2>
                </div>
                <Link href="/templates" className="text-xs font-bold text-primary hover:underline underline-offset-4">ALLE ANSEHEN</Link>
            </div>

            <div className="flex gap-4 overflow-x-auto px-5 pb-2 no-scrollbar scroll-smooth">
                {templates.length === 0 ? (
                    <Card className="min-w-[240px] bg-secondary/20 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2 border-0">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground font-medium">Noch keine Einheiten</p>
                    </Card>
                ) : templates.map((template) => (
                    <Link key={template.id} href={`/workout/active?templateId=${template.id}`} className="min-w-[170px] active:scale-95 transition-transform">
                        <Card className="bg-card ring-1 ring-white/5 shadow-sm border-0 rounded-2xl overflow-hidden h-full">
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
