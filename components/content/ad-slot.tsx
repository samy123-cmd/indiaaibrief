import { cn } from "@/lib/utils";

interface AdSlotProps {
  /** Reserved slot id for future AdSense mapping */
  slot:
    | "below-title"
    | "mid-article"
    | "below-article"
    | "sidebar";
  className?: string;
  label?: string;
}

/**
 * Static reserved ad space — prevents CLS when ads are enabled post-AdSense approval.
 * Do NOT inject ad scripts until AdSense is approved.
 */
export function AdSlot({
  slot,
  className,
  label = "Advertisement",
}: AdSlotProps) {
  const sizeClass =
    slot === "sidebar"
      ? "min-h-[250px] w-full max-w-[300px]"
      : slot === "mid-article"
        ? "min-h-[250px] w-full max-w-[300px] mx-auto"
        : "min-h-[100px] w-full md:min-h-[90px]";

  return (
    <aside
      data-ad-slot={slot}
      aria-label={label}
      className={cn(
        "my-6 flex flex-col items-center justify-center border border-dashed border-border bg-muted/40 text-center",
        sizeClass,
        className,
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
        {label}
      </span>
      <span className="sr-only">
        Reserved advertising space. Ads are not active until Google AdSense
        approval.
      </span>
    </aside>
  );
}
