import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, FileText, ExternalLink } from "lucide-react";
import { Norma } from "@/data/normas";
import { supabase } from "@/integrations/supabase/client";

interface PdfViewerModalProps {
  norma: Norma | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PdfViewerModal = ({ norma, open, onOpenChange }: PdfViewerModalProps) => {
  const popupWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    if (!open || !norma) return;

    const pdfUrl = getPdfUrl();
    
    // Abre o pop-up automaticamente quando o modal abre
    if (pdfUrl) {
      const width = 1000;
      const height = 800;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);

      popupWindowRef.current = window.open(
        pdfUrl,
        'WEGDocViewer',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=no,location=yes`
      );

      // Verifica se o pop-up foi bloqueado
      if (!popupWindowRef.current || popupWindowRef.current.closed) {
        console.warn('Pop-up bloqueado pelo navegador');
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModalAndPopup();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    // Cleanup: fecha o pop-up quando o modal for desmontado
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      closePopup();
    };
  }, [open, norma]);

  if (!norma || !open) return null;

  const getPdfUrl = () => {
    if (norma.pdfPath) {
      const { data } = supabase.storage.from('normas-pdfs').getPublicUrl(norma.pdfPath);
      return data.publicUrl;
    }
    return norma.pdfUrl;
  };

  const closePopup = () => {
    if (popupWindowRef.current && !popupWindowRef.current.closed) {
      popupWindowRef.current.close();
      popupWindowRef.current = null;
    }
  };

  const closeModalAndPopup = () => {
    closePopup();
    onOpenChange(false);
  };

  const handleReopenPopup = () => {
    const pdfUrl = getPdfUrl();
    if (!pdfUrl) return;

    // Se o pop-up já existe e está aberto, foca nele
    if (popupWindowRef.current && !popupWindowRef.current.closed) {
      popupWindowRef.current.focus();
      return;
    }

    // Caso contrário, abre um novo
    const width = 1000;
    const height = 800;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    popupWindowRef.current = window.open(
      pdfUrl,
      'WEGDocViewer',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=no,location=yes`
    );
  };

  const pdfUrl = getPdfUrl();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      onClick={closeModalAndPopup}
    >
      {/* Container Central */}
      <div
        className="relative w-[90vw] h-[90vh] max-w-7xl bg-card border-2 border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            onClick={closeModalAndPopup}
            className="text-white hover:bg-white/20 h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Área de Informação sobre Pop-up */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 p-8">
          <div className="w-full max-w-4xl h-full bg-background border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-6 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <ExternalLink className="w-12 h-12 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-foreground">
                Documento aberto em janela separada
              </h3>
              <p className="text-muted-foreground max-w-md">
                O documento foi aberto automaticamente em uma nova janela do navegador. 
                Se não visualizar a janela, verifique se o bloqueador de pop-ups está ativo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                onClick={handleReopenPopup}
                size="lg"
                className="gap-2"
                disabled={!pdfUrl}
              >
                <ExternalLink className="h-5 w-5" />
                Reabrir WEG Doc
              </Button>
              
              <Button
                onClick={closeModalAndPopup}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                Fechar Tudo
              </Button>
            </div>

            {!pdfUrl && (
              <p className="text-sm text-destructive mt-4">
                Nenhum PDF disponível para este documento
              </p>
            )}

            <div className="mt-8 p-4 bg-muted rounded-lg max-w-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Dica:</strong> Ao fechar este modal, a janela do documento também será fechada automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-card border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Pressione <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd> para fechar tudo • 
            Última atualização: {new Date(norma.ultimaAtualizacao).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
};
