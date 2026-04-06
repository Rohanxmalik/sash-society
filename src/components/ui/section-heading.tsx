import { cn } from "@/lib/utils";

export function SectionHeading({
  label,
  title,
  description,
  className,
  align = "left",
}: {
  label?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" && "text-center",
        className
      )}
    >
      {label && (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold-dark mb-3">
          {label}
        </p>
      )}
      <h2 className="text-3xl font-black tracking-tight text-ink sm:text-4xl lg:text-5xl font-heading">
        {title}
      </h2>
      {/* Decorative accent line */}
      <div className={cn(
        "mt-4 h-1 w-12 bg-brand-gold rounded-full",
        align === "center" && "mx-auto"
      )} />
      {description && (
        <p className="mt-4 max-w-2xl text-lg text-ink-light leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
