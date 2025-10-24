import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, FileText } from "lucide-react";
import { Norma } from "@/data/normas";
import { supabase } from "@/integrations/supabase/client";

interface PdfViewerModalProps {
  norma: Norma | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PdfViewerModal = ({ norma, open, onOpenChange }: PdfViewerModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // useEffect DEVE vir antes de qualquer early return
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  // Early returns DEPOIS de todos os hooks
  if (!norma || !open) return null;

  const getPdfUrl = () => {
    if (norma.pdfPath) {
      const { data } = supabase.storage.from('normas-pdfs').getPublicUrl(norma.pdfPath);
      return data.publicUrl;
    }
    return norma.pdfUrl;
  };

  const handleOpenExternal = () => {
    const pdfUrl = getPdfUrl();
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current && document.fullscreenEnabled) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.log('Fullscreen not available:', err);
      });
    }
  };

  const pdfUrl = getPdfUrl();

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      {/* Container Central */}
      <div
        className="relative w-[90vw] h-[90vh] max-w-7xl bg-card border-2 border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >


        
        <div className="flex items-center justify-between px-8 py-6 bg-primary border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {norma.titulo}
              </h2>
              {norma.descricao && (
                <p className="text-sm text-white/80 mt-1">{norma.descricao}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/20 h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Área de Visualização Simulada */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 p-8">
          <div className="w-full max-w-4xl h-full bg-background border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-6 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-12 h-12 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-foreground">
                Documento aberto em modo de visualização
              </h3>
              <p className="text-muted-foreground max-w-md">
                Para melhor compatibilidade e segurança, clique no botão abaixo para acessar o conteúdo completo em uma nova aba do navegador.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                onClick={handleOpenExternal}
                size="lg"
                className="gap-2"
                disabled={!pdfUrl}
              >
                <ExternalLink className="h-5 w-5" />
                Abrir no WEG Doc
              </Button>
              
              <Button
                onClick={handleFullscreen}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                Modo Tela Cheia
              </Button>
            </div>

            {!pdfUrl && (
              <p className="text-sm text-destructive mt-4">
                Nenhum PDF disponível para este documento
              </p>
            )}
          </div>
        </div>

        {/* Footer com Info */}
        <div className="px-8 py-4 bg-card border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Pressione <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd> para fechar • 
            Última atualização: {new Date(norma.ultimaAtualizacao).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
};
