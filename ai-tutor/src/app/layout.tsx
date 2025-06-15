import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";
import 'katex/dist/katex.min.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Tutor",
  description: "Your personal AI learning assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              {children}
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
