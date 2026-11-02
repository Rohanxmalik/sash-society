import { cn } from "@/frontend/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "gold" | "teal" | "outline";
  className?: string;
}) {
  const variants = {
    default: "bg-ink/10 text-ink hover:bg-ink/15",
    gold: "bg-brand-gold text-ink shadow-sm hover:shadow-md hover:bg-brand-gold-dark",
    teal: "bg-brand-dark-teal text-white shadow-sm hover:shadow-md hover:bg-brand-teal",
    outline: "border border-ink/20 text-ink-light hover:border-brand-dark-teal hover:text-brand-dark-teal",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-200",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
