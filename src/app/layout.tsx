import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { OfflineBanner } from "@/components/offline-banner";
import Providers from "@/components/providers";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { SplashScreen } from "@/components/splash-screen";

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "iTrack",
  },
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
    <html lang="de" className="dark h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300 h-full overflow-x-hidden`}
      >
        <AuthProvider>
          <Providers>
            <SplashScreen />
            <div className="min-h-screen bg-background flex flex-col">
              <div className="pt-safe-top flex-1 flex flex-col relative">
                <OfflineBanner />
                <main className="flex-1 pb-20 md:pb-0">
                  {children}
                </main>
                <BottomNav />
              </div>
            </div>
            <Toaster theme="dark" position="bottom-center" />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
