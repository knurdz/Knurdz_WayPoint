"use client";

import { useState, useEffect, useCallback } from "react";

export function useCopilot() {
  const [isOpen, setIsOpen] = useState(false);

  const openCopilot = useCallback(() => setIsOpen(true), []);
  const closeCopilot = useCallback(() => setIsOpen(false), []);
  const toggleCopilot = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCopilot();
      } else if (e.key === "Escape") {
        closeCopilot();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCopilot, closeCopilot]);

  return {
    isOpen,
    openCopilot,
    closeCopilot,
    toggleCopilot,
  };
}
