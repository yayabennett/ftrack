import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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

            {/* Global Dynamic Island / Notch safe area blur */}
            <div className="fixed top-0 inset-x-0 h-safe-top bg-background/60 backdrop-blur-[32px] z-[100] pointer-events-none" />

            <div className="min-h-screen bg-background flex flex-col pt-safe-top">
              <div className="flex-1 flex flex-col relative">
                <OfflineBanner />
                <main className="flex-1 flex flex-col">
                  {children}
                </main>
              </div>
            </div>
            <Toaster theme="dark" position="bottom-center" />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
