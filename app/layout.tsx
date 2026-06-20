import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ServiceWorkerRegistration from "./sw-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1d4ed8" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Dog Tracker",
    template: "%s | Dog Tracker",
  },
  description: "Track your dogs' health, vaccines, weights, and medications",
  applicationName: "Dog Tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Dog Tracker",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/paw-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/paw-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/paw-192.png", sizes: "192x192" }],
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
