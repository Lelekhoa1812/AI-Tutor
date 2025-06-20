"use client";

import type { ReactNode } from "react";
import { AnimatedLayout } from "./AnimatedLayout";
import { Navbar } from "./Navbar";
import { QueryClientProvider } from "@/components/providers/QueryClientProvider";
import { Toaster } from "@/components/ui/toaster";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <QueryClientProvider>
      <Navbar />
      <main className="container py-6">
        <AnimatedLayout>{children}</AnimatedLayout>
      </main>
      <Toaster />
    </QueryClientProvider>
  );
} 