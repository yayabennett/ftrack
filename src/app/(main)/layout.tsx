import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="flex-1 flex flex-col relative pb-24 md:pb-0">
                {children}
            </div>
            <BottomNav />
        </>
    );
}
