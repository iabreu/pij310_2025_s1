"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    // Format current date like "Segunda-feira, 22 de Abril, 2024"
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    setCurrentDate(now.toLocaleDateString("pt-BR", options));
  }, []);

  return (
    <header className="dark:bg-neutral-800 shadow-sm sticky">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title || `Bem-vindo, ${user?.email || "Usuário"}`}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm capitalize">
              {subtitle || currentDate}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
