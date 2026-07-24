/** Visible on keyboard focus — WCAG 2.1 AA skip navigation. */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="absolute left-4 top-4 z-[100] -translate-y-[200%] rounded-md bg-accent px-4 py-3 text-sm font-semibold text-primary-foreground outline-none transition-transform focus:translate-y-0"
    >
      Skip to main content
    </a>
  );
}
