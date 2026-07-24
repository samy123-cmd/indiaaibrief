import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: number;
  /** Show wordmark beside the mark */
  withWordmark?: boolean;
  priority?: boolean;
}

/**
 * Signal Brief mark — dossier lines cut by a live red pulse.
 */
export function BrandMark({
  className,
  size = 28,
  withWordmark = true,
  priority = false,
}: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/images/logo-mark.svg"
        alt=""
        width={size}
        height={size}
        priority={priority}
        className="shrink-0"
        aria-hidden
      />
      {withWordmark ? (
        <span className="text-base font-extrabold tracking-tight text-foreground">
          India<span className="text-accent">AI</span>Brief
        </span>
      ) : (
        <span className="sr-only">IndiaAIBrief</span>
      )}
    </span>
  );
}
