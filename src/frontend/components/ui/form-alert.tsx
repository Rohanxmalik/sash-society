import { cn } from "@/frontend/lib/utils";

const tones = {
  error: "bg-red-50 border-red-200 text-red-800",
  success: "bg-brand-gold/10 border-brand-gold/30 text-ink",
};

export function FormAlert({
  tone = "error",
  children,
}: {
  tone?: keyof typeof tones;
  children: React.ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("border rounded-sm px-4 py-3 text-sm", tones[tone])}
    >
      {children}
    </p>
  );
}
