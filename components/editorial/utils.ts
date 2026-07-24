export function impactColorClass(level: string): string {
  switch (level) {
    case "critical":
      return "bg-red-600/15 text-red-700 dark:text-red-300 border-red-600/30";
    case "high":
      return "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30";
    case "medium":
      return "bg-yellow-500/15 text-yellow-800 dark:text-yellow-300 border-yellow-500/30";
    case "low":
      return "bg-green-600/15 text-green-700 dark:text-green-300 border-green-600/30";
    default:
      return "bg-muted text-text-secondary border-border";
  }
}

export function formatRelative(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return date.toLocaleDateString("en-IN");
}
