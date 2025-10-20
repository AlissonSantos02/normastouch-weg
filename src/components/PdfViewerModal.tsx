import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ExternalLink } from "lucide-react";
import { Norma } from "@/data/normas";
import { supabase } from "@/integrations/supabase/client";

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

  const handleDownload = async () => {
    const pdfUrl = getPdfUrl();
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

  const pdfUrl = getPdfUrl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Cabeçalho WEG */}
        <DialogHeader className="px-8 py-6 bg-primary border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              {norma.titulo}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20 h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {norma.descricao && (
            <p className="text-sm text-white/80 mt-2">{norma.descricao}</p>
          )}
        </DialogHeader>

        {/* Área de Visualização do PDF */}
        <div className="flex-1 bg-muted/30 overflow-hidden">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full"
              title={norma.titulo}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <p className="text-muted-foreground text-lg mb-2">
                  Nenhum PDF disponível para visualização
                </p>
                <p className="text-sm text-muted-foreground">
                  Este documento ainda não possui um arquivo PDF vinculado.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        {pdfUrl && (
          <div className="px-8 py-4 bg-card border-t border-border flex gap-3 justify-end">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
            <Button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir em Nova Aba
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};