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
    <div className="min-h-screen pt-[84px] bg-gray-50 dark:bg-neutral-900">
      <Header title={title} subtitle={subtitle} />
      <main className="container flex h-[calc(100vh-84px)] t-[84px] my-auto p-4 md:px-6 overflow-y-auto">{children}</main>
    </div>
  );
}
