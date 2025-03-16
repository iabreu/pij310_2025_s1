"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import {
  PanelRightOpen,
  PanelRightClose,
  CirclePlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={cn(
        "flex h-full fixed lg:relative z-40 lg:z-auto top-0 left-0 lg:h-auto",
        isOpen && "border-r border-neutral-100 dark:border-neutral-900"
      )}
    >
      {!isOpen ? (
        <div className="flex items-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-2 mt-4"
          >
            <PanelRightClose className="w-6 h-6" />
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default Sidebar;
