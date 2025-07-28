//app/layout.tsx
import { Metadata, Viewport } from "next";
import Link from "next/link";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jotium.vercel.app"),
  title: "Jotium | The Digital Gennie",
  description: "Jotium Agent | Making your dreams come true.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Jotium" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased safe-area-padding">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
            position="top-center"
            toastOptions={{
              className: "text-xs sm:text-sm", // Smaller text for mobile and slightly larger for small screens
              style: {
                marginTop: "env(safe-area-inset-top, 0px)",
                padding: "8px 12px", // Reduced padding
              },
            }}
          />
          <SidebarProvider>
            <div className="flex flex-col min-h-screen w-full">
              <Navbar />
              <main className="flex-1 flex w-full justify-center overflow-hidden">
                <div className="w-full max-w-none">
                  {children}
                </div>
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
