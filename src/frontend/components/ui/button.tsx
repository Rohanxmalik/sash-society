import { cn } from "@/frontend/lib/utils";
import Link from "next/link";

type ButtonProps = {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  // For downloads: a plain link, which the router will not prefetch.
  fileLink?: boolean;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variants = {
  primary:
    "bg-brand-gold text-ink hover:bg-brand-gold-dark hover:shadow-lg hover:shadow-brand-gold/25 font-semibold active:scale-[0.97]",
  secondary:
    "bg-brand-dark-teal text-white hover:bg-brand-teal hover:shadow-lg hover:shadow-brand-dark-teal/25 font-semibold active:scale-[0.97]",
  outline:
    "border-2 border-ink text-ink hover:bg-ink hover:text-cream hover:shadow-lg font-semibold active:scale-[0.97]",
  ghost:
    "text-ink hover:bg-ink/5 font-medium",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  fileLink = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-sm transition-all duration-300 ease-out uppercase tracking-wider relative overflow-hidden",
    variants[variant],
    sizes[size],
    className
  );

  if (href && fileLink) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
