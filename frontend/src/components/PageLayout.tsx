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
      <main className="container flex h-[calc(100vh-84px)] my-auto p-8 md:px-6">{children}</main>
    </div>
  );
}
