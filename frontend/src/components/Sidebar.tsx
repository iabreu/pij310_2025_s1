"use client";

import React, { useState } from "react";
import {
  PanelRightClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar: React.FC = () => {
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
