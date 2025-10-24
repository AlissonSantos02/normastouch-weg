import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CategoryButtonProps {
  id: string;
  nome: string;
  icon: string;
  colorClass: string;
  normasCount?: number;
}

export const CategoryButton = ({ id, nome, icon, colorClass, normasCount = 0 }: CategoryButtonProps) => {
  const navigate = useNavigate();

  const iconColors = {
    electric: "text-[hsl(var(--electric-blue))]",
    mechanical: "text-[hsl(var(--mechanical-orange))]",
    process: "text-[hsl(var(--process-green))]",
    apt: "text-[hsl(var(--apt-pink))]",
  };

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
    {/* Icon Circle */}
    <div
      className={cn(
        "flex items-center justify-center w-28 h-28 rounded-full bg-secondary",
        "transition-transform duration-300 group-hover:scale-110"
      )}
    >
      <span className={cn("text-6xl", iconColors[colorClass as keyof typeof iconColors])}>
        {icon}
      </span>
    </div>
  
    {/* Content */}
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
