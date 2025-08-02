//app/layout.tsx
import { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

import { auth } from "@/app/(auth)/auth";
import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

import "./globals.css";

const geist = localFont({
  src: "../public/fonts/geist.woff2",
  variable: "--font-geist",
});

const geistMono = localFont({
  src: "../public/fonts/geist-mono.woff2",
  variable: "--font-geist-mono",
});

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
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Jotium" />
      </head>
      <body className="font-sans antialiased safe-area-padding">
        <SessionProvider session={session}>
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
        </SessionProvider>
      </body>
    </html>
  );
}