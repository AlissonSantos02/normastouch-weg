import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText } from "lucide-react";
import { Norma } from "@/data/normas";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface PdfViewerModalProps {
  norma: Norma | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PdfViewerModal = ({ norma, open, onOpenChange }: PdfViewerModalProps) => {
  if (!norma) return null;

  const getPdfUrl = () => {
    if (norma.pdfPath) {
      const { data } = supabase.storage.from('normas-pdfs').getPublicUrl(norma.pdfPath);
      return data.publicUrl;
    }
    return norma.pdfUrl;
  };

  const pdfUrl = getPdfUrl();

  const handleOpenPopup = () => {
    if (!pdfUrl) return;
    
    // Abre em nova janela pop-up com dimensões otimizadas
    const width = Math.min(1400, window.screen.width * 0.9);
    const height = Math.min(900, window.screen.height * 0.9);
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      pdfUrl,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`
    );
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;

    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${norma.titulo}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    }
  };

  // Abre automaticamente o pop-up quando o modal é aberto
  useEffect(() => {
    if (open && pdfUrl) {
      handleOpenPopup();
    }
  }, [open, pdfUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            {norma.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {norma.descricao && (
            <div>
              <h4 className="font-semibold mb-2">Descrição</h4>
              <p className="text-muted-foreground">{norma.descricao}</p>
            </div>
          )}

          {pdfUrl ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  O documento será aberto em uma nova janela pop-up para melhor visualização e compatibilidade.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleOpenPopup}
                    className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Visualizar PDF
                  </Button>
                  
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Download className="h-5 w-5" />
                    Baixar PDF
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                💡 Dica: Se o pop-up for bloqueado pelo navegador, permita pop-ups para este site
              </p>
            </div>
          ) : (
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground text-lg mb-2">
                Nenhum PDF disponível
              </p>
              <p className="text-sm text-muted-foreground">
                Este documento ainda não possui um arquivo PDF vinculado.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};