import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import { Providers } from "@/components/providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
