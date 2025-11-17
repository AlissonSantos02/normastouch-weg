import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Plus, Trash2, Upload, FileText, X } from "lucide-react";
import { Norma } from "@/contexts/NormasContext";
import { Categoria } from "@/data/normas";
import { useToast } from "@/hooks/use-toast";
import { useNormas } from "@/contexts/NormasContext";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";

export const AdminModal = () => {
  const { normas, addNorma, updateNorma, deleteNorma } = useNormas();
  const [open, setOpen] = useState(false);
  const [editingNorma, setEditingNorma] = useState<Norma | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "eletrica" as Categoria,
    descricao: "",
    pdfUrl: "",
    pdfPath: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      titulo: "",
      categoria: "eletrica",
      descricao: "",
      pdfUrl: "",
      pdfPath: "",
    });
    setSelectedFile(null);
    setEditingNorma(null);
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      toast({ title: "Apenas arquivos PDF são permitidos", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande. Máximo: 20MB", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const uploadPdfToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("normas-pdfs")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        return null;
      }

      return filePath;
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }

    setUploading(true);
    let pdfPath = formData.pdfPath;

    try {
      // Upload do arquivo, se houver
      if (selectedFile) {
        const uploadToastId = sonnerToast.loading("Fazendo upload do PDF...");
        const uploadedPath = await uploadPdfToStorage(selectedFile);

        if (!uploadedPath) {
          sonnerToast.dismiss(uploadToastId);
          toast({ title: "Erro ao fazer upload do arquivo", variant: "destructive" });
          setUploading(false);
          return;
        }

        sonnerToast.dismiss(uploadToastId);
        pdfPath = uploadedPath;

        // Deleta o arquivo antigo se estiver editando
        if (editingNorma?.pdf_path) {
          await supabase.storage.from("normas-pdfs").remove([editingNorma.pdf_path]);
        }
      }

      const pdfUrl = pdfPath
        ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/normas-pdfs/${pdfPath}`
        : formData.pdfUrl;

      if (editingNorma) {
        await updateNorma(editingNorma.id, {
          titulo: formData.titulo,
          categoria: formData.categoria,
          descricao: formData.descricao,
          pdf_url: pdfUrl,
          pdf_path: pdfPath,
        });
        sonnerToast.success("Norma atualizada com sucesso!");
      } else {
        await addNorma({
          titulo: formData.titulo,
          categoria: formData.categoria,
          descricao: formData.descricao,
          pdf_url: pdfUrl,
          pdf_path: pdfPath,
        });
        sonnerToast.success("Norma adicionada com sucesso!");
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar norma:", error);
      toast({ title: "Erro ao salvar norma", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta norma?")) {
      const norma = normas.find((n) => n.id === id);

      // Deletar arquivo do storage se existir
      if (norma?.pdf_path) {
        await supabase.storage.from("normas-pdfs").remove([norma.pdf_path]);
      }

      await deleteNorma(id);
      sonnerToast.success("Norma excluída com sucesso!");
    }
  };

  const handleEdit = (norma: Norma) => {
    setEditingNorma(norma);
    setFormData({
      titulo: norma.titulo,
      categoria: norma.categoria as Categoria,
      descricao: norma.descricao || "",
      pdfUrl: norma.pdf_url || "",
      pdfPath: norma.pdf_path || "",
    });
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gerenciar Normas</DialogTitle>
          <DialogDescription>Adicione, edite ou exclua normas do sistema</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {editingNorma ? "Editar Norma" : "Nova Norma"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Nome da norma"
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value: Categoria) =>
                    setFormData({ ...formData, categoria: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eletrica">Montagem Elétrica</SelectItem>
                    <SelectItem value="mecanica">Montagem Mecânica</SelectItem>
                    <SelectItem value="processos">Processos</SelectItem>
                    <SelectItem value="apts">APT's</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição opcional"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="pdfUrl">URL do PDF (opcional)</Label>
                <Input
                  id="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  placeholder="https://exemplo.com/norma.pdf"
                />
              </div>

              {/* Upload de Arquivo */}
              <div>
                <Label>Upload de PDF</Label>
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-between gap-3 bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">
                        Arraste e solte um PDF ou clique para selecionar
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">Máximo: 20MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Selecionar Arquivo
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={uploading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {uploading ? "Salvando..." : editingNorma ? "Atualizar" : "Adicionar"}
                </Button>
                {editingNorma && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de Normas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Normas Cadastradas ({normas.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {normas.map((norma) => (
                <div
                  key={norma.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{norma.titulo}</h4>
                      <p className="text-xs text-muted-foreground capitalize">
                        {norma.categoria}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(norma)}
                        className="h-8 px-2"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(norma.id)}
                        className="h-8 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
