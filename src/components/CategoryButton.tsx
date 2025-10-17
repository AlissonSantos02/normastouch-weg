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

  const colorClasses = {
    electric: "bg-gradient-electric hover:shadow-[0_8px_32px_-8px_hsl(var(--electric-blue)/0.5)] active:scale-[0.97]",
    mechanical: "bg-gradient-mechanical hover:shadow-[0_8px_32px_-8px_hsl(var(--mechanical-orange)/0.5)] active:scale-[0.97]",
    process: "bg-gradient-process hover:shadow-[0_8px_32px_-8px_hsl(var(--process-green)/0.5)] active:scale-[0.97]",
    apt: "bg-gradient-apt hover:shadow-[0_8px_32px_-8px_hsl(var(--apt-pink)/0.5)] active:scale-[0.97]",
  };

  return (
    <button
      onClick={() => navigate(`/categoria/${id}`)}
      className={cn(
        "relative w-full h-48 rounded-2xl shadow-lg transition-all duration-300",
        "flex flex-col items-center justify-center gap-4 text-white",
        "hover:scale-[1.02] hover:-translate-y-1",
        "touch-manipulation select-none",
        colorClasses[colorClass as keyof typeof colorClasses]
      )}
    >
      <div className="text-6xl drop-shadow-lg">{icon}</div>
      <div className="text-center px-6">
        <h2 className="text-2xl font-bold tracking-wide drop-shadow-md">{nome}</h2>
        {normasCount > 0 && (
          <p className="text-sm mt-2 opacity-90 font-medium">
            {normasCount} {normasCount === 1 ? "norma" : "normas"}
          </p>
        )}
      </div>
      <div className="absolute inset-0 rounded-2xl bg-white/0 hover:bg-white/10 transition-colors duration-300" />
    </button>
  );
};
