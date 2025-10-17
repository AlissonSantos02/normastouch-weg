import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Plus, Trash2 } from "lucide-react";
import { Norma, Categoria } from "@/data/normas";
import { useToast } from "@/hooks/use-toast";
import { useNormas } from "@/contexts/NormasContext";

export const AdminModal = () => {
  const { normas, setNormas } = useNormas();
  const [open, setOpen] = useState(false);
  const [editingNorma, setEditingNorma] = useState<Norma | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "eletrica" as Categoria,
    descricao: "",
    pdfUrl: "",
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      titulo: "",
      categoria: "eletrica",
      descricao: "",
      pdfUrl: "",
    });
    setEditingNorma(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }

    const hoje = new Date().toISOString().split("T")[0];

    if (editingNorma) {
      const updated = normas.map((n) =>
        n.id === editingNorma.id
          ? { ...n, ...formData, ultimaAtualizacao: hoje }
          : n
      );
      setNormas(updated);
      toast({ title: "Norma atualizada com sucesso!" });
    } else {
      const newNorma: Norma = {
        id: `${formData.categoria}-${Date.now()}`,
        ...formData,
        ultimaAtualizacao: hoje,
      };
      setNormas([...normas, newNorma]);
      toast({ title: "Norma adicionada com sucesso!" });
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta norma?")) {
      setNormas(normas.filter((n) => n.id !== id));
      toast({ title: "Norma excluída com sucesso!" });
    }
  };

  const handleEdit = (norma: Norma) => {
    setEditingNorma(norma);
    setFormData({
      titulo: norma.titulo,
      categoria: norma.categoria,
      descricao: norma.descricao || "",
      pdfUrl: norma.pdfUrl || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50">
          <Settings className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gerenciar Normas</DialogTitle>
          <DialogDescription>
            Adicione, edite ou exclua normas do sistema
          </DialogDescription>
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
                <Label htmlFor="pdfUrl">URL do PDF</Label>
                <Input
                  id="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  placeholder="https://exemplo.com/norma.pdf"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingNorma ? "Atualizar" : "Adicionar"}
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
