import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { FileText, LucideIcon } from "lucide-react";

interface CategoryButtonProps {
  id: string;
  nome: string;
  icone: string;
  color_class: string;
  normasCount?: number;
}

export const CategoryButton = ({ id, nome, icone, color_class, normasCount = 0 }: CategoryButtonProps) => {
  const navigate = useNavigate();

  const colorStyles: Record<string, { icon: string; bg: string; ring: string; glow: string }> = {
    electric: {
      icon: "text-[hsl(var(--electric-blue))]",
      bg: "bg-gradient-to-br from-[hsl(var(--electric-blue)/0.18)] to-[hsl(var(--electric-blue)/0.05)]",
      ring: "ring-[hsl(var(--electric-blue)/0.35)]",
      glow: "shadow-[0_8px_24px_-8px_hsl(var(--electric-blue)/0.55)]",
    },
    mechanical: {
      icon: "text-[hsl(var(--mechanical-orange))]",
      bg: "bg-gradient-to-br from-[hsl(var(--mechanical-orange)/0.20)] to-[hsl(var(--mechanical-orange)/0.05)]",
      ring: "ring-[hsl(var(--mechanical-orange)/0.35)]",
      glow: "shadow-[0_8px_24px_-8px_hsl(var(--mechanical-orange)/0.55)]",
    },
    process: {
      icon: "text-[hsl(var(--process-green))]",
      bg: "bg-gradient-to-br from-[hsl(var(--process-green)/0.20)] to-[hsl(var(--process-green)/0.05)]",
      ring: "ring-[hsl(var(--process-green)/0.35)]",
      glow: "shadow-[0_8px_24px_-8px_hsl(var(--process-green)/0.55)]",
    },
    apt: {
      icon: "text-[hsl(var(--apt-pink))]",
      bg: "bg-gradient-to-br from-[hsl(var(--apt-pink)/0.20)] to-[hsl(var(--apt-pink)/0.05)]",
      ring: "ring-[hsl(var(--apt-pink)/0.35)]",
      glow: "shadow-[0_8px_24px_-8px_hsl(var(--apt-pink)/0.55)]",
    },
    purple: {
      icon: "text-[hsl(var(--category-purple))]",
      bg: "bg-gradient-to-br from-[hsl(var(--category-purple)/0.20)] to-[hsl(var(--category-purple)/0.05)]",
      ring: "ring-[hsl(var(--category-purple)/0.35)]",
      glow: "shadow-[0_8px_24px_-8px_hsl(var(--category-purple)/0.55)]",
    },
    red: {
      icon: "text-[hsl(var(--category-red))]",
      bg: "bg-gradient-to-br from-[hsl(var(--category-red)/0.20)] to-[hsl(var(--category-red)/0.05)]",
      ring: "ring-[hsl(var(--category-red)/0.35)]",
      glow: "shadow-[0_8px_24px_-8px_hsl(var(--category-red)/0.55)]",
    },
    yellow: {
      icon: "text-[hsl(var(--category-yellow))]",
      bg: "bg-gradient-to-br from-[hsl(var(--category-yellow)/0.22)] to-[hsl(var(--category-yellow)/0.05)]",
      ring: "ring-[hsl(var(--category-yellow)/0.40)]",
      glow: "shadow-[0_8px_24px_-8px_hsl(var(--category-yellow)/0.55)]",
    },
    teal: {
      icon: "text-[hsl(var(--category-teal))]",
      bg: "bg-gradient-to-br from-[hsl(var(--category-teal)/0.20)] to-[hsl(var(--category-teal)/0.05)]",
      ring: "ring-[hsl(var(--category-teal)/0.35)]",
      glow: "shadow-[0_8px_24px_-8px_hsl(var(--category-teal)/0.55)]",
    },
    indigo: {
      icon: "text-[hsl(var(--category-indigo))]",
      bg: "bg-gradient-to-br from-[hsl(var(--category-indigo)/0.20)] to-[hsl(var(--category-indigo)/0.05)]",
      ring: "ring-[hsl(var(--category-indigo)/0.35)]",
      glow: "shadow-[0_8px_24px_-8px_hsl(var(--category-indigo)/0.55)]",
    },
    gray: {
      icon: "text-[hsl(var(--category-gray))]",
      bg: "bg-gradient-to-br from-[hsl(var(--category-gray)/0.18)] to-[hsl(var(--category-gray)/0.05)]",
      ring: "ring-[hsl(var(--category-gray)/0.35)]",
      glow: "shadow-[0_8px_24px_-8px_hsl(var(--category-gray)/0.45)]",
    },
  };

  const styles = colorStyles[color_class] || colorStyles.electric;
  const Icon = ((LucideIcons as unknown as Record<string, LucideIcon>)[icone]) || FileText;

  return (
    <button
      onClick={() => navigate(`/categoria/${id}`)}
      className={cn(
        "relative w-full h-60 rounded-xl bg-card border-2 border-border shadow-md transition-all duration-300",
        "flex items-center gap-10 px-10 text-left",
        "hover:shadow-[var(--shadow-blue)] hover:-translate-y-1",
        "touch-manipulation select-none group"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-28 h-28 rounded-full ring-2",
          styles.bg,
          styles.ring,
          styles.glow,
          "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        )}
      >
        <Icon className={cn("h-14 w-14 drop-shadow-sm", styles.icon)} strokeWidth={2.2} />
      </div>

      <div className="flex-1">
        <h2 className="text-3xl font-bold text-primary mb-2 tracking-tight">{nome}</h2>
        {normasCount > 0 && (
          <p className="text-base text-muted-foreground font-medium">
            {normasCount} {normasCount === 1 ? "norma disponível" : "normas disponíveis"}
          </p>
        )}
      </div>
    </button>
  );
};
