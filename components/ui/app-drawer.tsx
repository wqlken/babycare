"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

type AppDrawerProps = {
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function AppDrawer({
  children,
  description,
  footer,
  onClose,
  open,
  title,
}: AppDrawerProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="关闭抽屉"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
        type="button"
      />
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-xl border border-[var(--border-soft)] bg-[var(--surface)] shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:border-y-0 sm:border-r-0 sm:border-l"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-soft)] px-4 py-4">
          <div>
            <h2
              className="text-lg font-semibold text-[var(--foreground)]"
              id={titleId}
            >
              {title}
            </h2>
            {description ? (
              <p
                className="mt-1 text-sm text-[var(--text-muted)]"
                id={descriptionId}
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="关闭"
            className="bc-focus-ring flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--text-muted)]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-[var(--border-soft)] px-4 py-3">
            {footer}
          </div>
        ) : null}
      </section>
    </div>
  );
}
