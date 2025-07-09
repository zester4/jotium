import { Metadata } from "next";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <SidebarProvider>
            <Navbar />
            <main className="flex w-full justify-center">
              {children}
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
