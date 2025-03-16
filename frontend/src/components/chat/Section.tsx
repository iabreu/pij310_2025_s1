"use client";

import { useAuth } from "@/context/AuthContext";

export default function Section() {
  const { getToken } = useAuth();

  return (
    <div className="flex-1 w-full p-2 md:p-4 overflow-y-auto scroll-smooth">
      <div className="mx-auto h-full max-w-4xl px-4 lg:px-0 flex flex-col justify-between">
        <div className="flex flex-col items-start rounded-lg bg-background md:p-8">
          <h1 className="text-lg font-semibold mb-4">Welcome to Next.js!</h1>
          <p className="leading-normal text-muted-foreground mb-8">
            This is an open source app template built with Next.js, the Vercel
            AI SDK, Shadcn, TailwindCSS, TypeScript and Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
