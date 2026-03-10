export default function FocusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 flex flex-col relative">
            {children}
        </div>
    );
}
