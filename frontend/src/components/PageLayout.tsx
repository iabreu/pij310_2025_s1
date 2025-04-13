"use client";

import { ReactNode } from "react";
import Header from "./Header";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PageLayout({
  children,
  title,
  subtitle,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Header title={title} subtitle={subtitle} />

      <main className="container mx-auto px-4 md:px-6 py-8">{children}</main>
    </div>
  );
}
