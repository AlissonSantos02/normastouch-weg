import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, FileText, Maximize2, Minimize2 } from "lucide-react";
import { Norma } from "@/data/normas";
import { supabase } from "@/integrations/supabase/client";

interface PdfViewerModalProps {
  norma: Norma | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PdfViewerModal = ({ norma, open, onOpenChange }: PdfViewerModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showInternalPopup, setShowInternalPopup] = useState(false);
  const [isPopupMaximized, setIsPopupMaximized] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInternalPopup) {
          setShowInternalPopup(false);
        } else {
          onOpenChange(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange, showInternalPopup]);

  if (!norma || !open) return null;

  const getPdfUrl = () => {
    if (norma.pdfPath) {
      const { data } = supabase.storage.from('normas-pdfs').getPublicUrl(norma.pdfPath);
      return data.publicUrl;
    }
    return norma.pdfUrl;
  };

  const handleOpenInternal = () => {
    setShowInternalPopup(true);
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
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/20 h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Área de Visualização */}
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
                onClick={handleOpenInternal}
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

        {/* Footer */}
        <div className="px-8 py-4 bg-card border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Pressione <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd> para fechar • 
            Última atualização: {new Date(norma.ultimaAtualizacao).toLocaleDateString("pt-BR")}
          </p>
        </div>

        {/* Pop-up Interno (Modal dentro do Modal) */}
        {showInternalPopup && (
          <div
            className="absolute inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInternalPopup(false)}
          >
            <div
              className={`relative bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                isPopupMaximized 
                  ? 'w-[95%] h-[95%]' 
                  : 'w-[85%] h-[85%]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Barra de Navegador Simulada */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setShowInternalPopup(false)}
                      className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
                    />
                    <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600" />
                    <button 
                      onClick={() => setIsPopupMaximized(!isPopupMaximized)}
                      className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600"
                    />
                  </div>
                </div>
                
                <div className="flex-1 mx-4 flex items-center gap-2 bg-gray-700 rounded px-3 py-1.5 text-sm">
                  <span className="text-gray-400">🔒</span>
                  <span className="truncate text-gray-300">{pdfUrl}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsPopupMaximized(!isPopupMaximized)}
                  className="text-white hover:bg-gray-700 h-8 w-8"
                >
                  {isPopupMaximized ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Conteúdo do PDF (iframe ou visualização) */}
              <div className="flex-1 bg-gray-100 overflow-hidden">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0"
                    title="WEG Doc Viewer"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Documento não disponível</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
