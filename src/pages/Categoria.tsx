import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { categorias, Norma } from "@/data/normas";
import { SearchBar } from "@/components/SearchBar";
import { NormaCard } from "@/components/NormaCard";
import { PdfViewerModal } from "@/components/PdfViewerModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNormas } from "@/contexts/NormasContext";
import { useAuth } from "@/contexts/AuthContext";

const Categoria = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNorma, setSelectedNorma] = useState<Norma | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { normas, loading: normasLoading, refreshNormas } = useNormas();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleOpenModal = (norma: Norma) => {
    setSelectedNorma(norma);
    setModalOpen(true);
  };

  const categoria = categorias.find((cat) => cat.id === id);
  const normasCategoria = normas.filter((norma) => norma.categoria === id);

  const normasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return normasCategoria;
    
    const termo = searchTerm.toLowerCase();
    return normasCategoria.filter(
      (norma) =>
        norma.titulo.toLowerCase().includes(termo) ||
        norma.descricao?.toLowerCase().includes(termo) ||
        norma.id.toLowerCase().includes(termo)
    );
  }, [searchTerm, normasCategoria]);

  const handleAtualizarNormas = async () => {
    await refreshNormas();
    toast.success("Normas atualizadas!", {
      description: "Todos os documentos foram sincronizados com sucesso.",
    });
  };

  if (authLoading || normasLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  if (!categoria) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Categoria não encontrada</h1>
          <Button onClick={() => navigate("/")} size="lg">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="gap-2 h-14 px-6 text-base"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-4xl">{categoria.icon}</span>
              <h1 className="text-3xl font-bold">{categoria.nome}</h1>
            </div>

            <Button
              onClick={handleAtualizarNormas}
              variant="outline"
              size="lg"
              className="gap-2 h-14 px-6 text-base"
            >
              <RefreshCw className="h-5 w-5" />
              Atualizar
            </Button>
          </div>

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Buscar em ${categoria.nome.toLowerCase()}...`}
          />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {normasFiltradas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-2">
              {searchTerm ? "Nenhuma norma encontrada para sua busca" : "Nenhuma norma disponível nesta categoria"}
            </p>
            {searchTerm && (
              <p className="text-sm text-muted-foreground">
                Tente usar outros termos de busca
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-lg text-muted-foreground">
                {normasFiltradas.length} {normasFiltradas.length === 1 ? "norma encontrada" : "normas encontradas"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {normasFiltradas.map((norma, index) => (
                <div
                  key={norma.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-slide-up"
                >
                  <NormaCard 
                    norma={{
                      id: norma.id,
                      titulo: norma.titulo,
                      categoria: norma.categoria as any,
                      descricao: norma.descricao,
                      pdfUrl: norma.pdf_url,
                      pdfPath: norma.pdf_path,
                      ultimaAtualizacao: norma.updated_at || norma.created_at || new Date().toISOString(),
                    }} 
                    onOpenModal={handleOpenModal} 
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modal de Visualização de PDF */}
      <PdfViewerModal
        norma={selectedNorma}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Categoria;
