import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, FileText, ExternalLink, Monitor } from "lucide-react";
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
    
    if (pdfUrl) {
      // Configurações otimizadas do pop-up
      const popupWidth = 1200;
      const popupHeight = 900;
      const left = Math.max(0, (window.screen.width / 2) - (popupWidth / 2));
      const top = Math.max(0, (window.screen.height / 2) - (popupHeight / 2));

      const features = [
        `width=${popupWidth}`,
        `height=${popupHeight}`,
        `left=${left}`,
        `top=${top}`,
        'resizable=yes',           // Permite redimensionar
        'scrollbars=no',          // Mostra scrollbars
        'status=yes',              // Mostra status (alguns navegadores)
        'toolbar=no',              // Tenta esconder toolbar (ignorado)
        'menubar=no',              // Tenta esconder menubar (ignorado)
        'location=no',            // Barra de endereço (sempre visível)
        'directories=no',          // Sem diretórios
        'chrome=yes',              // Chrome/frame do navegador
        'centerscreen=yes',        // Centraliza (Firefox)
      ].join(',');

      popupWindowRef.current = window.open(
        pdfUrl,
        'WEGDocViewer',
        features
      );

      // Verifica bloqueio
      if (!popupWindowRef.current || popupWindowRef.current.closed) {
        console.warn('Pop-up bloqueado pelo navegador');
      } else {
        // Tenta focar no pop-up após abrir
        popupWindowRef.current.focus();
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModalAndPopup();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

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

    if (popupWindowRef.current && !popupWindowRef.current.closed) {
      popupWindowRef.current.focus();
      return;
    }

    const popupWidth = 1200;
    const popupHeight = 900;
    const left = Math.max(0, (window.screen.width / 2) - (popupWidth / 2));
    const top = Math.max(0, (window.screen.height / 2) - (popupHeight / 2));

    const features = [
      `width=${popupWidth}`,
      `height=${popupHeight}`,
      `left=${left}`,
      `top=${top}`,
      'resizable=yes',
      'scrollbars=yes',
      'status=yes',
    ].join(',');

    popupWindowRef.current = window.open(pdfUrl, 'WEGDocViewer', features);
    
    if (popupWindowRef.current) {
      popupWindowRef.current.focus();
    }
  };

  const pdfUrl = getPdfUrl();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      onClick={closeModalAndPopup}
    >
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

        {/* Área Central */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 p-8">
          <div className="w-full max-w-4xl h-full bg-background/80 backdrop-blur-sm border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-8 p-12 text-center">
            
            {/* Ícone animado */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <Monitor className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Documento WEG Doc Aberto
              </h3>
              <p className="text-muted-foreground max-w-xl text-lg">
                O documento foi aberto automaticamente em uma <strong>janela separada</strong> do navegador.
              </p>
              <p className="text-sm text-muted-foreground/80">
                Verifique se o bloqueador de pop-ups não impediu a abertura.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button
                onClick={handleReopenPopup}
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                disabled={!pdfUrl}
              >
                <ExternalLink className="h-5 w-5" />
                Reabrir / Focar Janela
              </Button>
              
              <Button
                onClick={closeModalAndPopup}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <X className="h-5 w-5" />
                Fechar Tudo
              </Button>
            </div>

            {!pdfUrl && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Nenhum PDF disponível para este documento
                </p>
              </div>
            )}

            <div className="mt-8 p-5 bg-muted/50 rounded-xl max-w-lg border border-border/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-lg">💡</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Sincronização Automática
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ao fechar este modal, a janela do documento será fechada automaticamente. 
                    Pressione <kbd className="px-1.5 py-0.5 bg-background rounded text-xs border">ESC</kbd> para fechar tudo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-card border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Última atualização: {new Date(norma.ultimaAtualizacao).toLocaleDateString("pt-BR")}
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-muted rounded">ESC</kbd>
              Fechar tudo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
