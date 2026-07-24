"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext(): SheetContextValue {
  const ctx = React.useContext(SheetContext);
  if (!ctx) {
    throw new Error("Sheet components must be used within <Sheet>");
  }
  return ctx;
}

function Sheet({
  children,
  open: openProp,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({
  children,
  asChild = false,
  className,
}: {
  children: React.ReactElement;
  asChild?: boolean;
  className?: string;
}) {
  const { setOpen } = useSheetContext();

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (event: React.MouseEvent) => void;
      className?: string;
    }>;
    return React.cloneElement(child, {
      onClick: (event: React.MouseEvent) => {
        child.props.onClick?.(event);
        setOpen(true);
      },
      className: cn(child.props.className, className),
    });
  }

  return (
    <button type="button" className={className} onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

function SheetClose({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { setOpen } = useSheetContext();
  return (
    <button type="button" className={className} onClick={() => setOpen(false)}>
      {children}
    </button>
  );
}

function SheetContent({
  children,
  side = "right",
  className,
}: {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  const { open, setOpen } = useSheetContext();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  if (!open || !mounted) return null;

  const panel = (
    <div className="fixed inset-0 z-[10050]" data-mobile-sheet="">
      {/* Opaque scrim — blocks page content completely */}
      <button
        type="button"
        aria-label="Close menu overlay"
        className="absolute inset-0 bg-background"
        style={{ backgroundColor: "var(--background)" }}
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute z-[10051] flex flex-col bg-background p-6 text-foreground shadow-2xl",
          side === "right" &&
            "inset-y-0 right-0 h-dvh w-full max-w-none border-l border-border sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 h-dvh w-full max-w-none border-r border-border sm:max-w-sm",
          side === "top" && "inset-x-0 top-0 border-b border-border",
          side === "bottom" && "inset-x-0 bottom-0 border-t border-border",
          className,
        )}
        style={{ backgroundColor: "var(--background)" }}
      >
        {children}
        <button
          type="button"
          className="absolute right-4 top-4 z-[10052] inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-muted text-foreground hover:bg-secondary"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );

  // Portal out of sticky header stacking context (backdrop-blur + z-40)
  return createPortal(panel, document.body);
}

function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 text-left", className)} {...props} />
  );
}

function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-text-secondary", className)} {...props} />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
