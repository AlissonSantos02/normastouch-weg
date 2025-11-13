import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categorias } from "@/data/normas";
import { CategoryButton } from "@/components/CategoryButton";
import { AdminModal } from "@/components/AdminModal";
import { useNormas } from "@/contexts/NormasContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const { normas, loading: normasLoading } = useNormas();
  const { user, role, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const getNormasCount = (categoriaId: string) => {
    return normas.filter((norma) => norma.categoria === categoriaId).length;
  };

  if (authLoading || normasLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header WEG Corporativo */}
      <header className="bg-primary shadow-lg">
        <div className="container mx-auto px-10 py-8">
          <div className="flex items-center justify-between">
            {/* Logo WEG */}
            <div className="flex items-center gap-5">
              <div className="flex items-center justify-center w-48 h-28 rounded-xl shadow-md">
                <img
                  src="/logo-weg-branco.png"
                  alt="Logo WEG"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Título e Subtítulo */}
            <div className="text-right flex items-center gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  Painel Digital de Normas
                </h1>
                <p className="text-white/80 text-base font-medium mt-2">
                  Sistema de consulta rápida de documentos técnicos
                </p>
              </div>
              <Button 
                onClick={signOut}
                variant="outline"
                size="icon"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Selecione uma Categoria
            </h2>
            <p className="text-muted-foreground text-lg">
              Toque em uma das categorias abaixo para visualizar as normas disponíveis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {categorias.map((categoria, index) => (
              <div
                key={categoria.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-scale-in"
              >
                <CategoryButton
                  {...categoria}
                  normasCount={getNormasCount(categoria.id)}
                />
              </div>
            ))}
          </div>

          {/* Info Footer */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-4 px-7 py-4 bg-card border border-border rounded-xl shadow-md">
              <div className="w-3 h-3 bg-process rounded-full animate-pulse" />
              <p className="text-base font-medium text-muted-foreground">
                Sistema ativo • {normas.length} normas disponíveis
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="container mx-auto px-10 text-center text-sm text-muted-foreground">
          <p className="font-medium">
            © 2025 WEG Equipamentos Elétricos • Painel Digital de Normas v1.0
          </p>
        </div>
      </footer>

      {/* Botão Admin Flutuante - Apenas para Administradores */}
      {role === 'admin' && <AdminModal />}
    </div>
  );
};

export default Index;
