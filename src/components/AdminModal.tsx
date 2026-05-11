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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Plus, Trash2, Upload, FileText, X, FolderPlus, Zap, Wrench, RefreshCw, ClipboardList, Cog, HardHat, ShieldAlert, Package, Factory, Hammer, Truck, Gauge, Lightbulb, Cable, Box, type LucideIcon } from "lucide-react";
import { Norma } from "@/contexts/NormasContext";
import { useToast } from "@/hooks/use-toast";
import { useNormas } from "@/contexts/NormasContext";
import { useCategorias } from "@/contexts/CategoriasContext";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";

export const AdminModal = () => {
  const { normas, addNorma, updateNorma, deleteNorma } = useNormas();
  const { categorias, addCategoria, deleteCategoria } = useCategorias();
  const [open, setOpen] = useState(false);
  const [editingNorma, setEditingNorma] = useState<Norma | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "",
    descricao: "",
    pdf_url: "",
    pdf_path: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Categoria form
  const [catOpen, setCatOpen] = useState(false);
  const [catForm, setCatForm] = useState({ id: "", nome: "", icone: "FileText", color_class: "electric" });
  const [savingCat, setSavingCat] = useState(false);

  const ICON_OPTIONS: { name: string; Icon: LucideIcon }[] = [
    { name: "Zap", Icon: Zap },
    { name: "Wrench", Icon: Wrench },
    { name: "Settings", Icon: Cog },
    { name: "RefreshCw", Icon: RefreshCw },
    { name: "ClipboardList", Icon: ClipboardList },
    { name: "HardHat", Icon: HardHat },
    { name: "ShieldAlert", Icon: ShieldAlert },
    { name: "Package", Icon: Package },
    { name: "Factory", Icon: Factory },
    { name: "Hammer", Icon: Hammer },
    { name: "Truck", Icon: Truck },
    { name: "Gauge", Icon: Gauge },
    { name: "Lightbulb", Icon: Lightbulb },
    { name: "Cable", Icon: Cable },
    { name: "Box", Icon: Box },
    { name: "FileText", Icon: FileText },
  ];

  const COLOR_OPTIONS = [
    { value: "electric", label: "Azul (Elétrica)" },
    { value: "mechanical", label: "Laranja (Mecânica)" },
    { value: "process", label: "Verde (Processos)" },
    { value: "apt", label: "Rosa (APT's)" },
  ];

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSaveCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.nome.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    setSavingCat(true);
    try {
      const id = (catForm.id.trim() || slugify(catForm.nome)) || `cat-${Date.now()}`;
      await addCategoria({ id, nome: catForm.nome, icone: catForm.icone, color_class: catForm.color_class });
      sonnerToast.success("Categoria criada com sucesso!");
      setCatForm({ id: "", nome: "", icone: "FileText", color_class: "electric" });
      setCatOpen(false);
    } catch (err: any) {
      toast({ title: "Erro ao criar categoria", description: err.message, variant: "destructive" });
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategoria = async (id: string) => {
    if (!confirm("Excluir esta categoria? Normas vinculadas continuarão existindo, mas sem categoria visível.")) return;
    try {
      await deleteCategoria(id);
      sonnerToast.success("Categoria excluída");
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      categoria: categorias[0]?.id || "",
      descricao: "",
      pdf_url: "",
      pdf_path: "",
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
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const uploadPdfToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("normas-pdfs")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

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
    if (!formData.categoria) {
      toast({ title: "Selecione uma categoria", variant: "destructive" });
      return;
    }

    setUploading(true);
    let pdf_path = formData.pdf_path;

    try {
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
        pdf_path = uploadedPath;

        if (editingNorma?.pdf_path) {
          await supabase.storage.from("normas-pdfs").remove([editingNorma.pdf_path]);
        }
      }

      const hoje = new Date().toISOString().split("T")[0];
      const pdf_url_Final = pdf_path
        ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/normas-pdfs/${pdf_path}`
        : formData.pdf_url;

      if (editingNorma) {
        await updateNorma(editingNorma.id, {
          titulo: formData.titulo,
          categoria: formData.categoria,
          descricao: formData.descricao,
          pdf_url: pdf_url_Final,
          pdf_path,
        });
        sonnerToast.success("Norma atualizada com sucesso!");
      } else {
        const newNorma: Omit<Norma, "id" | "created_at" | "updated_at"> = {
          titulo: formData.titulo,
          categoria: formData.categoria,
          descricao: formData.descricao,
          pdf_url: pdf_url_Final,
          pdf_path,
        };
        await addNorma(newNorma);
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

      if (norma?.pdf_path)
        await supabase.storage.from("normas-pdfs").remove([norma.pdf_path]);

      await deleteNorma(id);
      sonnerToast.success("Norma excluída com sucesso!");
    }
  };

  const handleEdit = (norma: Norma) => {
    setEditingNorma(norma);
    setFormData({
      titulo: norma.titulo,
      categoria: norma.categoria,
      descricao: norma.descricao || "",
      pdf_url: norma.pdf_url || "",
      pdf_path: norma.pdf_path || "",
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl">Gerenciar Normas</DialogTitle>
              <DialogDescription>Adicione, edite ou exclua normas e categorias</DialogDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setCatOpen((v) => !v)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              {catOpen ? "Fechar" : "Criar Categoria"}
            </Button>
          </div>
        </DialogHeader>

        {catOpen && (
          <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
            <h3 className="font-semibold">Nova Categoria</h3>
            <form onSubmit={handleSaveCategoria} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cat-nome">Nome *</Label>
                  <Input
                    id="cat-nome"
                    value={catForm.nome}
                    onChange={(e) => setCatForm({ ...catForm, nome: e.target.value })}
                    placeholder="Ex: HIDRÁULICA"
                  />
                </div>
                <div>
                  <Label htmlFor="cat-id">ID (opcional)</Label>
                  <Input
                    id="cat-id"
                    value={catForm.id}
                    onChange={(e) => setCatForm({ ...catForm, id: e.target.value })}
                    placeholder="Auto a partir do nome"
                  />
                </div>
              </div>

              <div>
                <Label>Cor</Label>
                <Select value={catForm.color_class} onValueChange={(v) => setCatForm({ ...catForm, color_class: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ícone</Label>
                <div className="grid grid-cols-8 gap-2 mt-2 p-3 border rounded-lg bg-background">
                  {ICON_OPTIONS.map(({ name, Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setCatForm({ ...catForm, icone: name })}
                      className={`flex items-center justify-center h-10 w-10 rounded-md border transition-colors ${
                        catForm.icone === name
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                      title={name}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={savingCat}>
                <Plus className="h-4 w-4 mr-2" />
                {savingCat ? "Salvando..." : "Criar Categoria"}
              </Button>
            </form>

            {categorias.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Categorias existentes</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {categorias.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm p-2 bg-background rounded">
                      <span>{c.nome} <span className="text-muted-foreground">({c.id})</span></span>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCategoria(c.id)} className="h-7 px-2 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{editingNorma ? "Editar Norma" : "Nova Norma"}</h3>
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
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
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
                <Label htmlFor="pdf_url">URL do PDF (opcional)</Label>
                <Input
                  id="pdf_url"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  placeholder="https://exemplo.com/norma.pdf"
                />
              </div>

              {/* Upload */}
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

          {/* Lista */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Normas Cadastradas ({normas.length})</h3>
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
