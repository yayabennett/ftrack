import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { OfflineBanner } from "@/components/offline-banner";
import Providers from "@/components/providers";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iTrack — Workout Tracker",
  description: "Die premium Fitness-App für dein Training",
  manifest: "/manifest.json",
  openGraph: {
    title: "iTrack — Workout Tracker",
    description: "Die premium Fitness-App für dein Training",
    url: "https://iTrack.vercel.app", // Replace with real URL
    siteName: "iTrack",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Workout Tracker",
    description: "Ultra-fast workout tracking PWA",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground safe-bottom pb-20 md:pb-0 transition-colors duration-300`}
      >
        <AuthProvider>
          <Providers>
            <OfflineBanner />
            <main className="pb-20 min-h-screen">
              {children}
            </main>
            <BottomNav />
          </Providers>
        </AuthProvider>
        <Toaster theme="dark" position="bottom-center" />
      </body>
    </html>
  );
}
