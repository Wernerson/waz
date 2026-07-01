"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { NewLeadForm } from "@/app/NewLeadForm";

const buttonClass = "block w-full text-left px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"

export function NewMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<"lead" | "issue" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Create new"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        +
      </Button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 min-w-36 border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          <button
            type="button"
            role="menuitem"
            className={buttonClass}
            onClick={() => {
              setIsOpen(false);
              setActiveDialog("lead");
            }}
          >
            New Lead
          </button>
          <button
            type="button"
            role="menuitem"
            className={buttonClass}
            onClick={() => {
              setIsOpen(false);
              setActiveDialog("issue");
            }}
          >
            New Issue
          </button>
        </div>
      ) : null}

      {activeDialog ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setActiveDialog(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-item-dialog-title"
            className="w-full max-w-lg border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="new-item-dialog-title"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
              >
                {activeDialog === "lead" ? "New Lead" : "New Issue"}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close dialog"
                onClick={() => setActiveDialog(null)}
              >
                ×
              </Button>
            </div>

            {activeDialog === "lead" ? (
              <NewLeadForm
                onCancel={() => setActiveDialog(null)}
                onCreated={() => setActiveDialog(null)}
              />
            ) : (
              <>
                <div className="mt-4 border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                  Form placeholder — the issue form will be added here.
                </div>

                <div className="mt-4 flex justify-end">
                  <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
