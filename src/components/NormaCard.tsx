import { FileText, Download, Calendar } from "lucide-react";
import { Norma } from "@/data/normas";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NormaCardProps {
  norma: Norma;
}

export const NormaCard = ({ norma }: NormaCardProps) => {
  const handleOpenPdf = () => {
    if (norma.pdfUrl) {
      window.open(norma.pdfUrl, "_blank");
    } else {
      toast.info("PDF não disponível", {
        description: "Este documento ainda não possui um arquivo PDF vinculado.",
      });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (norma.pdfUrl) {
      toast.success("Download iniciado", {
        description: `Baixando: ${norma.titulo}`,
      });
    } else {
      toast.error("Download indisponível", {
        description: "Este documento não possui arquivo para download.",
      });
    }
  };

  return (
    <div
      onClick={handleOpenPdf}
      className={cn(
        "group relative bg-card rounded-xl p-6 shadow-md hover:shadow-xl",
        "transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]",
        "border-2 border-border hover:border-primary/50",
        "cursor-pointer touch-manipulation select-none",
        "min-h-[140px] flex flex-col justify-between"
      )}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-7 h-7 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {norma.titulo}
          </h3>
          {norma.descricao && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {norma.descricao}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Atualizado em {new Date(norma.ultimaAtualizacao).toLocaleDateString("pt-BR")}</span>
        </div>
        
        <button
          onClick={handleDownload}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-primary/10 hover:bg-primary/20 text-primary",
            "transition-colors duration-200 text-sm font-medium"
          )}
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
